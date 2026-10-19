import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let source = root.appendingPathComponent("src/assets/images/tufast128.png")
let target = root.appendingPathComponent("safari/TUfast Safari/Shared (App)/Assets.xcassets/AppIcon.appiconset/universal-icon-1024@1x.png")
guard let input = CGImageSourceCreateWithURL(source as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(input, 0, nil),
      let context = CGContext(data: nil, width: 1024, height: 1024, bitsPerComponent: 8,
                              bytesPerRow: 4096, space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
    fatalError("Cannot prepare the app icon")
}
context.setFillColor(CGColor(gray: 0.12, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
context.interpolationQuality = .high
context.draw(image, in: CGRect(x: 128, y: 128, width: 768, height: 768))
guard let output = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(target as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fatalError("Cannot encode app icon")
}
CGImageDestinationAddImage(destination, output, nil)
if !CGImageDestinationFinalize(destination) { fatalError("Cannot write app icon") }
