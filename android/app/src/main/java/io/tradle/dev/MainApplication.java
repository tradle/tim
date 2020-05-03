package io.tradle.dev;

import android.app.Application;
import android.content.Context;
import androidx.multidex.MultiDex;
import androidx.multidex.MultiDexApplication;

import com.BV.LinearGradient.LinearGradientPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
// import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactlibrary.RNReactNativeZoomSdkPackage;
import com.regula.documentreader.RNRegulaDocumentReaderPackage;
// import com.microblink.reactnative.MicroblinkReactPackage;
import com.cardio.RNCardIOPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.yamill.orientation.OrientationPackage;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.microsoft.codepush.react.CodePush;
import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.rn.ecc.ECCPackage;
import com.tradle.react.UdpSocketsModule;

import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.reactnative.camera.RNCameraPackage;

import java.util.Arrays;
import java.util.List;

import io.branch.referral.Branch;
import io.branch.rnbranch.RNBranchPackage;
import io.tradle.reactlocalauth.LocalAuthPackage;
import io.tradle.reactimagestore.ImageStorePackage;
import io.tradle.reactkeeper.RNTradleKeeperPackage;
import io.tradle.snappystorage.RNAsyncSnappyStoragePackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;

// import com.instabug.reactlibrary.RNInstabugReactnativePackage;
//import io.tradle.RNBlinkIDPackage;

//import io.tradle.nfc.RNPassportReaderPackage;

// import com.anyline.reactnative.AnylinePackage;
// import com.peel.react.TcpSocketsModule;

// public class MainApplication extends Application implements ReactApplication {
public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected String getJSBundleFile() {
        return CodePush.getJSBundleFile("main.jsbundle");
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = Arrays.<ReactPackage>asList(
        new MainReactPackage(),
            new RNCWebViewPackage(),
            new RNCViewPagerPackage(),
            // new AsyncStoragePackage(),
            new NetInfoPackage(),
        new RNReactNativeZoomSdkPackage(),
        new RNRegulaDocumentReaderPackage(),
        new ImageStorePackage(),
        new RNFetchBlobPackage(),
        new RNTradleKeeperPackage(),
        // new MicroblinkReactPackage(),
        new RNCardIOPackage(),
        new SplashScreenReactPackage(),
        new RNBranchPackage(),
        new TcpSocketsModule(),
        new RNOSModule(),
        new ReactNativeExceptionHandlerPackage(),
        new RNAsyncSnappyStoragePackage(),
        // new AnylinePackage(),
        new ReactNativePushNotificationPackage(),
        new RNDeviceInfo(),
        new ImagePickerPackage(),
        new RandomBytesPackage(),
        new KeychainPackage(),
        new VectorIconsPackage(),
        new UdpSocketsModule(),
        new ReactNativeLocalizationPackage(),
        new LinearGradientPackage(),
        new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG),
        new RNCameraPackage(),
        new OrientationPackage(),
        new ECCPackage(),
        new LocalAuthPackage(),
        new ReactNativeDocumentPicker()
//        new RNBlinkIDPackage()
//        new RNPassportReaderPackage()
      );

      // if (!getUseDeveloperSupport()) {
      //   packages.add(new RNInstabugReactnativePackage.Builder("YOUR_ANDROID_APPLICATION_TOKEN", MainApplication.this)
      //            .setInvocationEvent("shake")
      //            .setPrimaryColor("#1D82DC")
      //            .setFloatingEdge("left")
      //            .setFloatingButtonOffsetFromTop(250)
      //            .build());
      // }

      return packages;
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }

  @Override
  protected void attachBaseContext(Context context) {
    super.attachBaseContext(context);
    MultiDex.install(this);
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    Branch.getAutoInstance(this);
  }
}
