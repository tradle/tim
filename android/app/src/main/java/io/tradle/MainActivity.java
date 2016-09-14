package io.tradle;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      // set database limit to 200MB
      ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(200000000L);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Tradle";
    }
}
