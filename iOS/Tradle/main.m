/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>

#import "AppDelegate.h"
#import "QTouchposeApplication.h"

int main(int argc, char *argv[])
{
  @autoreleasepool
  {
//#ifdef DEBUG
   return UIApplicationMain(argc, argv,
                            NSStringFromClass([QTouchposeApplication class]),
                            NSStringFromClass([AppDelegate class]));
//#else
    // return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
//#endif
  }
}
