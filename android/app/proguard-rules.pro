# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# START Facebook Conceal (https://github.com/facebook/conceal/blob/v.1.1.3/proguard_annotations.pro)
# Keep our interfaces so they can be used by other ProGuard rules.
# See http://sourceforge.net/p/proguard/bugs/466/
-keep,allowobfuscation @interface com.facebook.crypto.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.crypto.proguard.annotations.KeepGettersAndSetters

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.crypto.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.crypto.proguard.annotations.DoNotStrip *;
}

-keepclassmembers @com.facebook.crypto.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# END Facebook Conceal

## Start React Native

-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }

## END React Native


# react-native-branch
-dontwarn io.branch.**

# https://github.com/nhachicha/SnappyDB/issues/78

#SnappyDB
-dontwarn sun.reflect.**
-dontwarn java.beans.**
-dontwarn sun.nio.ch.**
-dontwarn sun.misc.**

-keep class com.esotericsoftware.** {*;}

-keep class java.beans.** { *; }
-keep class sun.reflect.** { *; }
-keep class sun.nio.ch.** { *; }

-keep class com.snappydb.** { *; }
-dontwarn com.snappydb.**

# https://github.com/luggit/react-native-config/pull/30/files
-keep class io.tradle.dev.BuildConfig { *; }

# https://github.com/facebook/react-native/issues/11891
-dontwarn android.text.StaticLayout

# https://stackoverflow.com/questions/42872700/proguard-app-crash-caused-by-java-lang-nosuchfielderror-no-lcom-facebook-jni
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor { *; }
-keep class com.facebook.react.bridge.queue.NativeRunnable { *; }
-keep class com.facebook.react.bridge.ReadableType { *; }

-printconfiguration config.txt
