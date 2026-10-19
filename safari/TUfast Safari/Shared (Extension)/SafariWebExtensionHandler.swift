import SafariServices
import Security

final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private let platforms = ["zih", "slub", "zih-totp", "zih-iotp", "slub-totp", "slub-iotp"]

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem
        let profile = (item?.userInfo?[SFExtensionProfileKey] as? UUID)?.uuidString ?? "default"
        var result: [String: Any]
        do {
            guard let message = item?.userInfo?[SFExtensionMessageKey] as? [String: Any],
                  let operation = message["operation"] as? String else {
                throw StoreError.invalidRequest
            }
            let platform = message["platform"] as? String
            if let platform, !platforms.contains(platform) { throw StoreError.invalidRequest }
            let service = "\(Bundle.main.bundleIdentifier ?? "TUfast").credentials.\(profile)"
            switch operation {
            case "get":
                guard let platform else { throw StoreError.invalidRequest }
                result = ["ok": true, "value": try read(service, platform) ?? [:]]
            case "exists":
                let candidates = platform.map { [$0] } ?? platforms
                var exists = false
                for candidate in candidates {
                    if try read(service, candidate) != nil { exists = true; break }
                }
                result = ["ok": true, "value": exists]
            case "set":
                guard let platform, let data = message["data"] as? [String: String],
                      let user = data["user"], !user.isEmpty,
                      let pass = data["pass"], !pass.isEmpty else { throw StoreError.invalidRequest }
                let encoded = try JSONSerialization.data(withJSONObject: ["user": user, "pass": pass])
                let query = query(service, platform)
                let status = SecItemUpdate(query as CFDictionary, [kSecValueData: encoded] as CFDictionary)
                if status == errSecItemNotFound {
                    var record = query
                    record[kSecValueData] = encoded
                    record[kSecAttrAccessible] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
                    try check(SecItemAdd(record as CFDictionary, nil))
                } else { try check(status) }
                result = ["ok": true, "value": true]
            case "delete":
                guard let platform else { throw StoreError.invalidRequest }
                let status = SecItemDelete(query(service, platform) as CFDictionary)
                if status != errSecItemNotFound { try check(status) }
                result = ["ok": true, "value": true]
            default:
                throw StoreError.invalidRequest
            }
        } catch {
            // Never log native messages: they may contain passwords or OTP seeds.
            result = ["ok": false, "error": "Keychain unavailable or request invalid. Unlock this device and try again."]
        }
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: result]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    private func query(_ service: String, _ account: String) -> [CFString: Any] {
        var query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: account,
            kSecAttrSynchronizable: false
        ]
        #if os(macOS)
        query[kSecUseDataProtectionKeychain] = true
        #endif
        return query
    }

    private func read(_ service: String, _ account: String) throws -> [String: String]? {
        var query = query(service, account)
        query[kSecReturnData] = true
        query[kSecMatchLimit] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        try check(status)
        guard let data = result as? Data,
              let record = try JSONSerialization.jsonObject(with: data) as? [String: String],
              record["user"] != nil, record["pass"] != nil else { throw StoreError.invalidRequest }
        return record
    }

    private func check(_ status: OSStatus) throws {
        if status != errSecSuccess { throw StoreError.status(status) }
    }

    private enum StoreError: Error {
        case invalidRequest
        case status(OSStatus)
    }
}
