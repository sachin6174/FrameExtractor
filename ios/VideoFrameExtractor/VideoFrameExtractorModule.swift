import Foundation
import AVFoundation
import React

@objc(VideoFrameExtractor)
class VideoFrameExtractor: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func extractFrames(_ videoPath: String,
                     timestamps: [NSNumber],
                     outputDir: String,
                     quality: Double,
                     resolver: @escaping RCTPromiseResolveBlock,
                     rejecter: @escaping RCTPromiseRejectBlock) {
    
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let url: URL
        if videoPath.hasPrefix("file://") {
          guard let fileURL = URL(string: videoPath) else {
            rejecter("INVALID_URL", "Invalid video URL", nil)
            return
          }
          url = fileURL
        } else if videoPath.hasPrefix("ph://") || videoPath.hasPrefix("assets-library://") {
          // Handle Photos library assets
          rejecter("UNSUPPORTED", "Please use file:// URLs. Copy video to app storage first.", nil)
          return
        } else {
          url = URL(fileURLWithPath: videoPath)
        }
        
        let asset = AVURLAsset(url: url)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.requestedTimeToleranceBefore = .zero
        generator.requestedTimeToleranceAfter = .zero
        
        var extractedPaths: [String] = []
        
        for (index, timestamp) in timestamps.enumerated() {
          autoreleasepool {
            let seconds = timestamp.doubleValue / 1000.0
            let time = CMTime(seconds: seconds, preferredTimescale: 600)
            
            do {
              let cgImage = try generator.copyCGImage(at: time, actualTime: nil)
              
              #if os(iOS)
              let image = UIImage(cgImage: cgImage)
              guard let data = image.pngData() else {
                return
              }
              #else
              let image = NSImage(cgImage: cgImage, size: NSZeroSize)
              guard let tiffData = image.tiffRepresentation,
                    let bitmapImage = NSBitmapImageRep(data: tiffData),
                    let data = bitmapImage.representation(using: .png, properties: [:]) else {
                return
              }
              #endif
              
              let filename = String(format: "frame_%05d.png", index + 1)
              let filePath = (outputDir as NSString).appendingPathComponent(filename)
              let fileURL = URL(fileURLWithPath: filePath)
              
              try data.write(to: fileURL, options: .atomic)
              extractedPaths.append(filePath)
              
            } catch {
              print("Error extracting frame at \(seconds)s: \(error)")
            }
          }
        }
        
        DispatchQueue.main.async {
          resolver(extractedPaths)
        }
        
      } catch {
        DispatchQueue.main.async {
          rejecter("EXTRACTION_ERROR", error.localizedDescription, error)
        }
      }
    }
  }
}
