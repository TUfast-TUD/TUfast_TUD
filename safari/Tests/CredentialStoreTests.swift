import XCTest
import SafariServices
import UIKit
import WebKit

final class CredentialStoreTests: XCTestCase {
    private let profile = UUID()

    private final class Context: NSExtensionContext {
        var items: [Any] = []
        var response: [String: Any] = [:]
        override var inputItems: [Any] { items }
        override func completeRequest(returningItems items: [Any]?, completionHandler: ((Bool) -> Void)? = nil) {
            response = (items?.first as? NSExtensionItem)?.userInfo?[SFExtensionMessageKey] as? [String: Any] ?? [:]
            completionHandler?(true)
        }
    }

    private func request(_ operation: String, platform: String = "zih", data: [String: String]? = nil, profile: UUID? = nil) -> [String: Any] {
        var message: [String: Any] = ["operation": operation, "platform": platform]
        if let data { message["data"] = data }
        let item = NSExtensionItem()
        item.userInfo = [SFExtensionMessageKey: message, SFExtensionProfileKey: profile ?? self.profile]
        let context = Context()
        context.items = [item]
        SafariWebExtensionHandler().beginRequest(with: context)
        return context.response
    }

    override func tearDown() {
        for platform in ["zih", "zih-totp", "slub"] { _ = request("delete", platform: platform) }
        super.tearDown()
    }

    func testCredentialRoundTripUpdateAndDelete() {
        XCTAssertEqual(request("exists")["value"] as? Bool, false)
        XCTAssertEqual(request("set", data: ["user": "test-user", "pass": "test-password"])["ok"] as? Bool, true)
        XCTAssertEqual(request("exists")["value"] as? Bool, true)
        XCTAssertEqual((request("get")["value"] as? [String: String])?["pass"], "test-password")
        XCTAssertEqual(request("set", data: ["user": "test-user", "pass": "updated-password"])["ok"] as? Bool, true)
        XCTAssertEqual((request("get")["value"] as? [String: String])?["pass"], "updated-password")
        XCTAssertEqual(request("delete")["ok"] as? Bool, true)
        XCTAssertEqual(request("exists")["value"] as? Bool, false)
    }

    func testProfileAndPlatformIsolation() {
        XCTAssertEqual(request("set", data: ["user": "test-user", "pass": "test-password"])["ok"] as? Bool, true)
        XCTAssertEqual(request("exists", profile: UUID())["value"] as? Bool, false)
        XCTAssertEqual(request("exists", platform: "slub")["value"] as? Bool, false)
        XCTAssertEqual(request("exists", platform: "zih-totp")["value"] as? Bool, false)
    }

    func testInvalidRequestsCannotWriteCredentials() {
        XCTAssertEqual(request("set", platform: "unknown", data: ["user": "test", "pass": "test"])["ok"] as? Bool, false)
        XCTAssertEqual(request("set", data: ["user": "test", "pass": ""])["ok"] as? Bool, false)
        XCTAssertEqual(request("unexpected")["ok"] as? Bool, false)
        XCTAssertEqual(request("exists")["value"] as? Bool, false)
    }

    @MainActor
    func testContainingAppSetupLoadsAndFits() throws {
        let loaded = expectation(description: "Local setup page rendered")
        func webView(in view: UIView) -> WKWebView? {
            if let web = view as? WKWebView { return web }
            return view.subviews.compactMap { webView(in: $0) }.first
        }
        let window = try XCTUnwrap(UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first?.windows.first)
        let web = try XCTUnwrap(webView(in: window))
        func check() {
            web.evaluateJavaScript("document.querySelector('h1')?.textContent") { value, _ in
                if let title = value as? String, title.contains("TUfast") { loaded.fulfill() }
                else { DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { check() } }
            }
        }
        check()
        wait(for: [loaded], timeout: 10)
        let measured = expectation(description: "Setup layout")
        web.evaluateJavaScript("({width: innerWidth, contentWidth: document.documentElement.scrollWidth, height: document.querySelector('main').getBoundingClientRect().height, text: document.body.innerText})") { value, error in
            XCTAssertNil(error)
            if let result = value as? [String: Any], let width = result["width"] as? Double,
               let contentWidth = result["contentWidth"] as? Double, let height = result["height"] as? Double {
                XCTAssertLessThanOrEqual(contentWidth, width + 1)
                XCTAssertGreaterThan(height, 100)
                XCTAssertTrue((result["text"] as? String)?.contains("Keychain") == true || (result["text"] as? String)?.contains("Schlüsselbund") == true)
            } else { XCTFail("Could not measure the setup page") }
            measured.fulfill()
        }
        wait(for: [measured], timeout: 10)
    }
}
