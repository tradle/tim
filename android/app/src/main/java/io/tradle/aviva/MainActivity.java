package io.tradle.aviva;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

import io.fabric.sdk.android.Fabric;
import com.cboy.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
      SplashScreen.show(this);
      super.onCreate(savedInstanceState);
      // set database limit to 200MB
      ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(200000000L);
      Fabric.with(this, new Crashlytics());
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Tradle";
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
      super.onConfigurationChanged(newConfig);
      Intent intent = new Intent("onConfigurationChanged");
      intent.putExtra("newConfig", newConfig);
      this.sendBroadcast(intent);
    }

}
