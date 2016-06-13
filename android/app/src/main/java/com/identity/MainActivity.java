package com.identity;

import java.util.Arrays;
import java.util.List;

import com.facebook.react.ReactActivity;
import com.bitgo.randombytes.RandomBytesPackage;
import com.oblador.keychain.KeychainPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.tradle.react.UdpSocketsModule;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.BV.LinearGradient.LinearGradientPackage.*;
import com.microsoft.codepush.react.CodePush;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import com.microsoft.codepush.react.CodePush;
import com.lwansbrough.RCTCamera.*;
import com.brentvatne.react.*;
import com.oblador.vectoricons.*;
import com.tradle.react.*;
import com.BV.LinearGradient.*;
import com.babisoft.ReactNativeLocalization.*;

public class MainActivity extends ReactActivity {
    @Override
    protected String getMainComponentName() {
        return "Tradle";
    }

    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected String getJSBundleFile() {
        return BuildConfig.DEBUG ? super.getJSBundleFile() : CodePush.getBundleUrl();
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.asList(
            new MainReactPackage(),
            new RandomBytesPackage(),
            new KeychainPackage(),
            new ReactVideoPackage(),
            new VectorIconsPackage(),
            new UdpSocketsModule(),
            new ReactNativeLocalizationPackage(),
            new LinearGradientPackage(),
            new CodePush(this.getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), this, BuildConfig.DEBUG),
            new RCTCameraPackage()
//                ,
//            new CodePush(BuildConfig.CODEPUSH_KEY, this, BuildConfig.DEBUG)
        );
    }
}
