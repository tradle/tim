
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <DocumentReader/DocumentReader-Swift.h>

@interface RNRegulaDocumentReaderBeta : NSObject <RCTBridgeModule>

@property (strong, nonatomic) DocReader *docReader;
@property (strong, nonatomic) NSString *currentScenario;

@end
