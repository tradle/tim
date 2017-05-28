
#import "RNIproov.h"
#import <iProov/iProov-Swift.h>

@implementation RNIproov

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(enroll:(NSDictionary*)props
                  callback:(RCTResponseSenderBlock)callback)
{
  NSString* username = [props valueForKey:@"username"];
  NSString* serviceProvider = [props valueForKey:@"serviceProvider"];
  NSString* token = [props valueForKey:@"token"];
  bool animated = [props valueForKey:@"animated"];
  dispatch_async(dispatch_get_main_queue(), ^{
    if (token == nil) {
      [IProov enrolWithServiceProvider:serviceProvider username:username animated:animated success:^(NSString* token) {
        callback(@[[NSNull null], @{
          @"success": @YES,
          @"token": token
        }]);
      } failure:^(NSString* reason) {
        callback(@[[NSNull null], @{
          @"success": @NO,
          @"reason": reason
        }]);
      } error:^(NSError* error) {
        callback(@[[RNIproov normalizeError:error]]);
      }];
    } else {
      [IProov enrolWithToken:token username:username animated:true success:^(NSString* token) {
        callback(@[[NSNull null], token]);
      } failure:^(NSString* reason) {
        callback(@[reason]);
      } error:^(NSError* error) {
        callback(@[[RNIproov normalizeError:error]]);
      }];
    }
  });
}

RCT_EXPORT_METHOD(verify:(NSDictionary*)props
                  callback:(RCTResponseSenderBlock)callback)
{
  NSString* username = [props valueForKey:@"username"];
  NSString* serviceProvider = [props valueForKey:@"serviceProvider"];
  NSString* token = [props valueForKey:@"token"];
  bool animated = [props valueForKey:@"animated"];
  dispatch_async(dispatch_get_main_queue(), ^{
    if (token == nil) {
      [IProov verifyWithServiceProvider:serviceProvider username:username animated:animated success:^(NSString* token) {
        callback(@[[NSNull null], @{
          @"success": @YES,
          @"token": token
        }]);
      } failure:^(NSString* reason) {
        callback(@[[NSNull null], @{
          @"success": @NO,
          @"reason": reason
        }]);
      } error:^(NSError* error) {
        callback(@[[RNIproov normalizeError:error]]);
      }];
    } else {
      [IProov verifyWithToken:token username:username animated:true success:^(NSString* token) {
        callback(@[[NSNull null], token]);
      } failure:^(NSString* reason) {
        callback(@[reason]);
      } error:^(NSError* error) {
        callback(@[[RNIproov normalizeError:error]]);
      }];
    }
  });
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (NSDictionary*) normalizeError:(NSError*) error {
  return @{
           @"code": [NSNumber numberWithInt:error.code],
           @"message": error.localizedDescription
           };
}

@end
