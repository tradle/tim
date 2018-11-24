@import UIKit;
#import "RNRegulaDocumentReaderBeta.h"

@implementation RNRegulaDocumentReaderBeta

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initialize:(RCTResponseSenderBlock)callback)
{
    NSString *dataPath = [[NSBundle mainBundle] pathForResource:@"regula.license" ofType:nil];
    NSData *licenseData = [NSData dataWithContentsOfFile:dataPath];

    ProcessParams *params = [[ProcessParams alloc] init];
    self.docReader = [[DocReader alloc] initWithProcessParams:params];

    [self.docReader initilizeReaderWithLicense:licenseData completion:^(BOOL successful, NSString * _Nullable error ) {
        if (successful) {
            callback(@[[NSNull null], [NSNull null]]);
        } else {
            callback(@[error, [NSNull null]]);
        }
    }];
}

RCT_EXPORT_METHOD(showScanner:(NSDictionary*)opts callback:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *currentViewController = [[[UIApplication sharedApplication] keyWindow] rootViewController];

        [self.docReader.processParams setValuesForKeysWithDictionary:opts[@"processParams"]];
        [self.docReader.customization setValuesForKeysWithDictionary:opts[@"customization"]];
        [self.docReader.functionality setValuesForKeysWithDictionary:opts[@"functionality"]];

        [self.docReader showScanner:currentViewController completion:^(enum DocReaderAction action, DocumentReaderResults * _Nullable result, NSString * _Nullable error) {
            switch (action) {
                case DocReaderActionCancel: {
                    callback(@[@"Cancelled by user", [NSNull null]]);
                }
                    break;

                case DocReaderActionComplete: {
                    NSLog(@"Completed");
                    if (result != nil) {
                        NSMutableDictionary *totalResults = [NSMutableDictionary new];
                        NSMutableArray *jsonResults = [NSMutableArray array];
                        for (DocumentReaderJsonResultGroup *resultObject in result.jsonResult.results) {
                            [jsonResults addObject:resultObject.jsonResult];
                        }
                        [totalResults setObject:jsonResults forKey:@"jsonResult"];
                        UIImage *image = [result getGraphicFieldImageByTypeWithFieldType:GraphicFieldTypeGf_DocumentFront source:ResultTypeRawImage];

                        NSData *data = UIImagePNGRepresentation(image);
                        [self->_bridge.imageStoreManager storeImageData:data withBlock:^(NSString *imageTag) {
                            totalResults[@"image"] = imageTag;
                            callback(@[[NSNull null], totalResults]);
                        }];
                    }
                }
                    break;

                case DocReaderActionError: {
                  callback(@[error, [NSNull null]]);
                }
                    break;

                default:
                    break;
            }
        }];
    });
}

- (NSString *) encodeToBase64String:(UIImage *)image {
    return [UIImageJPEGRepresentation(image, 0.8) base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

@end
