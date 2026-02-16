#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoFrameExtractor, NSObject)

RCT_EXTERN_METHOD(extractFrames:(NSString *)videoPath
                  timestamps:(NSArray *)timestamps
                  outputDir:(NSString *)outputDir
                  quality:(double)quality
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
