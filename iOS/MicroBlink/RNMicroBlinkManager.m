//
//  RNMicroBlinkManager.m
//  tradleblink
//
//  Created by Mark Vayngrib on 12/28/16.
//

#import <Foundation/Foundation.h>
#import "RNMicroBlinkManager.h"
#import <MicroBlink/MicroBlink.h>
#import "RCTConvert.h"

// RNMB - react native micro blink
NSString *const RNMBDocumentDecodingId = @"RNMBDocumentDecodingId";
NSString *const RNMBMRTDDecodingId = @"RNMBMRTDDecodingId";
NSString *const RNMBScanInProgressError = @"RNMBScanInProgressError";

@interface RNMicroBlinkManager () <RCTBridgeModule, PPScanningDelegate>

@property (nonatomic, strong) RCTResponseSenderBlock callback;
@property (nonatomic, strong) UIImage* dewarpedImage;
@property (nonatomic, strong) UIImage* image;
@property (nonatomic, strong) NSDictionary* options;
@property (nonatomic, strong) NSString* licenseKey;

@end

@implementation RNMicroBlinkManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setKey:(NSString*) key)
{
  self.licenseKey = key;
}

RCT_EXPORT_METHOD(scan:(NSDictionary*) options callback:(RCTResponseSenderBlock)callback)
{
  if (self.callback) {
    callback(@[RNMBScanInProgressError]);
    return;
  }

  self.callback = callback;
  self.options = options;
  NSString* imagePath = [options valueForKey:@"imagePath"];
  BOOL outputBase64 = [options valueForKey:@"base64"];
  BOOL needImage = imagePath != nil || outputBase64;
  PPSettings* settings = [[PPSettings alloc] init];
  NSString* licenseKey = [options objectForKey:@"licenseKey"];
  if (!licenseKey) licenseKey = self.licenseKey;
  settings.licenseSettings.licenseKey = licenseKey;

  NSDictionary* mrtd = [options objectForKey:@"mrtd"];
  if (mrtd) {
    PPMrtdRecognizerSettings *mrtdRecognizerSettings = [[PPMrtdRecognizerSettings alloc] init];
    mrtdRecognizerSettings.dewarpFullDocument = needImage;
    // TODO: copy over settings from mrtd -> mrtdRecognizerSettings
    [settings.scanSettings addRecognizerSettings:mrtdRecognizerSettings];
  }

  NSDictionary* usdl = [options objectForKey:@"usdl"];
  if (usdl) {
    PPUsdlRecognizerSettings *usdlRecognizerSettings = [[PPUsdlRecognizerSettings alloc] init];
    // TODO: copy over settings from usdl -> usdlRecognizerSettings
    [settings.scanSettings addRecognizerSettings:usdlRecognizerSettings];
  }

  NSDictionary* eudl = [options objectForKey:@"eudl"];
  if (eudl) {
    PPEudlRecognizerSettings *eudlRecognizerSettings = [[PPEudlRecognizerSettings alloc] init];
    // TODO: copy over settings from eudl -> eudlRecognizerSettings
    [settings.scanSettings addRecognizerSettings:eudlRecognizerSettings];
  }

  if (needImage) {
    settings.metadataSettings.dewarpedImage = YES; // get dewarped image of ID documents
    settings.metadataSettings.successfulFrame = YES;
  }

////  NSDictionary* detector = [options objectForKey:@"detector"];
////  if (detector) {
//    // TODO: copy settings from options
//
//    PPDecodingInfo *decodingInfo = [[PPDecodingInfo alloc] initWithLocation:CGRectMake(0.0, 0.0, 1.0, 1.0) dewarpedHeight:700 uniqueId:RNMBDocumentDecodingId];
//
//    PPDocumentSpecification *documentSpecification = [PPDocumentSpecification newFromPreset:PPDocumentPresetId1Card];
//    //set desired decoding info
//    [documentSpecification setDecodingInfo:@[decodingInfo]];
//
//    // adjust specification properties to your need
//
//    // Sets portrait scale of document
//    // Portrait scale defines minimum (scale - tolerance) and maximum (scale + tolerance) size of scanned document as a portion of input image.
////    documentSpecification.portraitScale = PPMakeScale(0.8,0.2);
////    documentSpecification.xRange = PPMakeRange();
//
//    // Document detector
//    PPDocumentDetectorSettings *documentDetectorSettings = [[PPDocumentDetectorSettings alloc] initWithNumStableDetectionsThreshold:1];
//
//    // Add created PPDocumentSpecification classes to list of specifications
//    [documentDetectorSettings setDocumentSpecifications:@[documentSpecification]];
//
//    PPDecodingInfo *mrtdInfo = [[PPDecodingInfo alloc] initWithLocation:CGRectMake(0.0, 0.0, 1.0, 1.0) dewarpedHeight:700 uniqueId:RNMBMRTDDecodingId];
//
//    // MRTD detector
//    // Use previously created PPDocumentDecodingInfo as mrtdInfo
//    PPMrtdDetectorSettings *mrtdDetectorSettings = [[PPMrtdDetectorSettings alloc] initWithDecodingInfoArray:@[mrtdInfo]];
//
//    // since we need to use both MRTD and Document Detectors, we need to wrap them in Multi detector
//     PPMultiDetectorSettings *multiDetectorSettings = [[PPMultiDetectorSettings alloc] initWithSettingsArray:@[documentDetectorSettings, mrtdDetectorSettings]];
//     multiDetectorSettings.allowMultipleResults = YES;
//
//    // Wrap it all in PPDetectorRecognizerSettings and add it to scanSettings
//     PPDetectorRecognizerSettings *detectorRecognizerSettings = [[PPDetectorRecognizerSettings alloc] initWithDetectorSettings:multiDetectorSettings];
////    PPDetectorRecognizerSettings *detectorRecognizerSettings = [[PPDetectorRecognizerSettings alloc] initWithDetectorSettings:documentDetectorSettings];
//    [settings.scanSettings addRecognizerSettings:detectorRecognizerSettings];
//
////    PPDetectorSettings *detectorRecognizerSettings = [[PPDetectorSettings alloc] init];
////    // TODO: copy over settings from detector -> detectorRecognizerSettings
////    [settings.scanSettings addRecognizerSettings:detectorRecognizerSettings];
////  }

  NSError *error;
  PPCameraCoordinator *coordinator = [[PPCameraCoordinator alloc] initWithSettings:settings];

  /** If scanning isn't supported, present an error */
  if (coordinator == nil) {
    [self resetScanState];
    callback(@[[error localizedDescription]]);

//    NSString *messageString = [error localizedDescription];
//    [[[UIAlertView alloc] initWithTitle:@"Warning"
//                                message:messageString
//                               delegate:nil
//                      cancelButtonTitle:@"OK"
//                      otherButtonTitles:nil, nil] show];

    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [self getRoot];
    while (root.presentedViewController != nil) {
      root = root.presentedViewController;
    }

    /** Allocate and present the scanning view controller */
    UIViewController<PPScanningViewController>* scanningViewController = [PPViewControllerFactory cameraViewControllerWithDelegate:self coordinator:coordinator error:nil];

    // allow rotation if VC is displayed as a modal view controller
    scanningViewController.autorotate = YES;
    scanningViewController.supportedOrientations = UIInterfaceOrientationMaskAll;

    /** You can use other presentation methods as well */
    [root presentViewController:scanningViewController animated:YES completion:nil];
  });
}

RCT_EXPORT_METHOD(dismiss)
{
  [self dismissScanningView];
}

- (UIViewController*) getRoot
{
  UIViewController *root = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
  while (root.presentedViewController != nil) {
    root = root.presentedViewController;
  }

  return root;
}

#pragma mark - PPScanDelegate

- (void)scanningViewControllerUnauthorizedCamera:(UIViewController<PPScanningViewController> *)scanningViewController {
  // Add any logic which handles UI when app user doesn't allow usage of the phone's camera
}

- (void)scanningViewController:(UIViewController<PPScanningViewController> *)scanningViewController
                  didFindError:(NSError *)error {
  // Can be ignored. See description of the method
  NSLog(@"experienced an error %@", error);
}

- (void)scanningViewControllerDidClose:(UIViewController<PPScanningViewController> *)scanningViewController {

  // As scanning view controller is presented full screen and modally, dismiss it
  [self dismissScanningView];
}

- (void)scanningViewController:(UIViewController<PPScanningViewController> *)scanningViewController
              didOutputResults:(NSArray<PPRecognizerResult*> *)results {

  /**
   * Here you process scanning results. Scanning results are given in the array of PPRecognizerResult objects.
   * Each member of results array will represent one result for a single processed image
   * Usually there will be only one result. Multiple results are possible when there are 2 or more detected objects on a single image (i.e. pdf417 and QR code side by side)
   */

  NSMutableDictionary* json = [NSMutableDictionary dictionary];

  // Collect data from the result
  for (PPRecognizerResult* result in results) {
    NSString* key;
    NSDictionary* resultData;
    if ([result isKindOfClass:[PPMrtdRecognizerResult class]]) {
      key = @"mrtd";
      resultData = [self getMrtdResultProps:(PPMrtdRecognizerResult*)result];
      /** MRTD was detected */
    }
    else if ([result isKindOfClass:[PPUsdlRecognizerResult class]]) {
      /** US drivers license was detected */
      key = @"usdl";
      resultData = [self getUsdlResultProps:(PPUsdlRecognizerResult*)result];
    }
    else if ([result isKindOfClass:[PPEudlRecognizerResult class]]) {
      /** EU drivers license was detected */
      key = @"eudl";
      resultData = [self getEudlResultProps:(PPEudlRecognizerResult*)result];
    }
//    else if ([result isKindOfClass:[PPMyKadRecognizerResult class]]) {
//      /** MyKad was detected */
//      key = @"MyKad";
////      PPMyKadRecognizerResult *myKadResult = (PPMyKadRecognizerResult *)result;
////      [result setValue:[myKadResult getAllElements] forKey:@"MyKad"];
////      title = @"MyKad";
////      message = [myKadResult description];
//    }
    else if ([result isKindOfClass:[PPCroIDFrontRecognizerResult class]]) {
      /** MyKad was detected */
      key = @"croIDFront";
//      resultData = [self getCroIdFrontProps:(PPCroIDFrontRecognizerResult *)result];
    }
    else if ([result isKindOfClass:[PPCroIDBackRecognizerResult class]]) {
      /** MyKad was detected */
      key = @"croIDBack";
//      resultData = [self getCroIdBackProps:(PPCroIDBackRecognizerResult *)result];
    }

    if (resultData) {
      [json setObject:resultData forKey:key];
//      [json setObject:[result getAllElements] forKey:key];
    } else {
      NSLog(@"ignoring result %@", result);
    }

    // if ([result isKindOfClass:[PPDetectorRecognizerResult class]]) {
    //   PPDetectorRecognizerResult *detectorRecognizerResult = (PPDetectorRecognizerResult *)result;
    //   PPQuadDetectorResult *quadResult = nil;

    //   // PPQuadDetectorResult contains rectangle of located object
    //   if ([detectorRecognizerResult.detectorResult isKindOfClass:[PPQuadDetectorResult class]]) {
    //     quadResult = (PPQuadDetectorResult *)detectorRecognizerResult;
    //   }

    //   // PPMultiDetectorResult can also contain PPQuadDetectorResult
    //   if ([detectorRecognizerResult.detectorResult isKindOfClass:[PPMultiDetectorResult class]]) {
    //     PPMultiDetectorResult *multiResult = (PPMultiDetectorResult *)detectorRecognizerResult;
    //     for (PPDetectorResult *result in multiResult.detectorResults) {
    //       if ([detectorRecognizerResult.detectorResult isKindOfClass:[PPQuadDetectorResult class]]) {
    //         quadResult = (PPQuadDetectorResult *)detectorRecognizerResult;
    //       }
    //     }
    //   }

    //   NSLog(@"%@", [quadResult.detectionLocation toPointsArray]);
    // }
  };

  if ([json count] == 0) return;

  // first, pause scanning until we process all the results
  [scanningViewController pauseScanning];

//  NSMutableDictionary* result = [NSMutableDictionary dictionaryWithDictionary:@{
//                           @"title":title,
//                           @"message":message
//                           }];

  NSNumber* quality = [self.options valueForKey:@"quality"];
  if (quality == nil) quality = @1.0;

  NSData *data;
  UIImage* image = self.dewarpedImage;
  if (!image) image = self.image;

  if (image) {
    BOOL isPNG = [[[self.options objectForKey:@"imageFileType"] stringValue] isEqualToString:@"png"];
    if (isPNG) {
      data = UIImagePNGRepresentation(image);
    }
    else {
      data = UIImageJPEGRepresentation(image, [quality floatValue]);
    }

    NSString* imagePath = [self.options objectForKey:@"imagePath"];
    if (imagePath) {
      [data writeToFile:imagePath atomically:YES];
    }

    NSMutableDictionary* imageInfo = [NSMutableDictionary dictionary];
    [imageInfo setObject:@(image.size.width) forKey:@"width"];
    [imageInfo setObject:@(image.size.height) forKey:@"height"];
    if ([[self.options objectForKey:@"base64"] boolValue]) {
      NSString* base64 = [data base64EncodedStringWithOptions:0];
      NSString* prefix = isPNG ? @"data:image/png;base64," : @"data:image/jpeg;base64,";
      [imageInfo setObject:[prefix stringByAppendingString:base64] forKey:@"base64"];
    }

    [json setObject:imageInfo forKey:@"image"];
  }

  RCTResponseSenderBlock callback = self.callback;
  [self resetScanState];
  [[self getRoot] dismissViewControllerAnimated:YES completion:nil];
  callback(@[[NSNull null], json]);
}

- (void) resetScanState {
  self.callback = nil;
  self.options = nil;
  self.dewarpedImage = nil;
  self.image = nil;
}

- (void)scanningViewController:(UIViewController<PPScanningViewController> *)scanningViewController didFinishDetectionWithResult:(PPDetectorResult *)result {
  if (result) {
    NSLog(@"finished with result: %@", result);
  }
}

- (void)scanningViewController:(UIViewController<PPScanningViewController> *)scanningViewController didOutputMetadata:(PPMetadata *)metadata {

  // Check if metadata obtained is image. You can set what type of image is outputed by setting different properties of PPMetadataSettings (currently, dewarpedImage is set at line 57)
  if ([metadata isKindOfClass:[PPImageMetadata class]]) {

    PPImageMetadata *imageMetadata = (PPImageMetadata *)metadata;

    if ([imageMetadata.name isEqualToString:@"MRTD"] ||
        [imageMetadata.name isEqualToString:@"USDL"] ||
        [imageMetadata.name isEqualToString:@"EUDL"]) {
      self.dewarpedImage = imageMetadata.image;
    } else {
      self.image = imageMetadata.image;
    }
  }
}

- (NSDictionary*) getMrtdResultProps:(PPMrtdRecognizerResult*) mrtdResult {
  return @{
           @"personal": @{
             @"lastName": [mrtdResult primaryId],
             @"firstName": [mrtdResult secondaryId],
             @"nationality": [mrtdResult nationality],
             @"sex": [mrtdResult sex]
           },
           @"document": @{
             @"issuer": [mrtdResult issuer],
             @"documentNumber": [mrtdResult documentNumber],
             @"documentCode": [mrtdResult documentCode],
             @"dateOfExpiry": [self dateToMillis:[mrtdResult dateOfExpiry]],
             @"dateOfBirth": [self dateToMillis:[mrtdResult dateOfBirth]],
             @"opt1": [mrtdResult opt1],
             @"opt2": [mrtdResult opt2],
             @"mrzText": [mrtdResult mrzText]
           }
        };
}

- (NSDictionary*) getUsdlResultProps:(PPUsdlRecognizerResult*) usdlResult {
  return @{
           @"personal": @{
             @"firstName": [usdlResult getField:kPPCustomerFirstName],
             @"lastName": [usdlResult getField:kPPCustomerFamilyName],
             @"fullName": [usdlResult getField:kPPCustomerFullName],
             @"dateOfBirth": [usdlResult getField:kPPDateOfBirth],
             @"kPPSex": [[usdlResult getField:kPPSex] isEqualToString:@"1"] ? @"M" : @"F",
             @"eyeColor": [usdlResult getField:kPPEyeColor],
             @"heightCm": [usdlResult getField:kPPHeightCm]
           },
           @"address": @{
               @"full": [usdlResult getField:kPPFullAddress],
               @"street": [usdlResult getField:kPPAddressStreet],
               @"city": [usdlResult getField:kPPAddressCity],
               @"state": [usdlResult getField:kPPAddressJurisdictionCode],
               @"postalCode": [usdlResult getField:kPPAddressJurisdictionCode],
           },
           @"document": @{
               @"dateOfIssue": [usdlResult getField:kPPDocumentIssueDate],
               @"dateOfExpiry": [usdlResult getField:kPPDocumentExpirationDate],
               @"issueIdentificationNumber": [usdlResult getField:kPPIssuerIdentificationNumber],
               @"jurisdictionVersionNumber": [usdlResult getField:kPPJurisdictionVersionNumber],
               @"jurisdictionVehicleClass": [usdlResult getField:kPPJurisdictionVehicleClass],
               @"jurisdictionRestrictionCodes": [usdlResult getField:kPPJurisdictionRestrictionCodes],
               @"jurisdictionEndorsementCodes": [usdlResult getField:kPPJurisdictionEndorsementCodes],
               @"documentNumber": [usdlResult getField:kPPCustomerIdNumber],
               // deprecated
               @"customerIdNumber": [usdlResult getField:kPPCustomerIdNumber]
           },
         };
}

- (NSDictionary*) getEudlResultProps:(PPEudlRecognizerResult*) eudlResult {
  PPEudlCountry euCountry = [eudlResult country];
  NSString* country;
  switch (euCountry) {
    case PPEudlCountryUnitedKingdom:
      country = @"GBR";
      break;
    case PPEudlCountryGermany:
      country = @"DEU";
      break;
    case PPEudlCountryAustria:
      country = @"AUT";
      break;
    case PPEudlCountryAny:
      country = @"";
      break;
  }

//  NSDictionary* names = [self parseName:[eudlResult ownerFirstName]];
  return @{
    @"personal": @{
      @"firstName": [eudlResult ownerFirstName],
      @"lastName": [eudlResult ownerLastName],
      @"birthData": [eudlResult ownerBirthData]
    },
    @"address": @{
      @"full": [eudlResult ownerAddress]
    },
    @"document": @{
      @"dateOfIssue": [eudlResult documentIssueDate],
      @"dateOfExpiry": [eudlResult documentExpiryDate],
      @"documentNumber": [eudlResult driverNumber] ?: [NSNull null],
      @"personalNumber": [eudlResult personalNumber] ?: [NSNull null],
      @"issuer": [eudlResult documentIssuingAuthority],
      @"country": country
    }
  };
}

- (NSNumber*) dateToMillis:(NSDate*) date {
  return @((long long)([date timeIntervalSince1970] * 1000.0));
}

// dismiss the scanning view controller when user presses OK.
//- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
//  [self dismissScanningView];
//}

- (void) dismissScanningView {
  [self resetScanState];
  [[self getRoot] dismissViewControllerAnimated:YES completion:nil];
}

//- (NSDictionary*) parseName: (NSString*)name {
//  NSMutableDictionary names = [NSMutableDictionary dictionary];
//  [name split
//}

@end
