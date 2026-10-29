# TradePulse AI - ProGuard Rules
# Preserves Retrofit, Gson, OkHttp, and Firebase models during optimization

# Gson & Data Models
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.tradepulse.app.data.model.** { *; }

# Retrofit 2
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Exceptions

# OkHttp 3
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Firebase Models & Services
-keepattributes *Annotation*,InnerClasses
-dontnote com.google.android.gms.**
-dontwarn com.google.android.gms.**
-keep class com.google.firebase.** { *; }
-keep class com.tradepulse.app.firebase.** { *; }

# Kotlin Coroutines
-keepclassmembers class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# Android WebKit JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
