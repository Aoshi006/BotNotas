package com.aoshi.prisma;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String PRISMA_URL = "https://aoshi006.github.io/Prisma/";
    private static final int FILE_CHOOSER_CODE = 7041;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        configureWebView();

        if (savedInstanceState == null) {
            webView.loadUrl(PRISMA_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " PrismaAndroid/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new PrismaAndroidBridge(), "PrismaAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri.getHost() != null && uri.getHost().equalsIgnoreCase("aoshi006.github.io")) {
                    return false;
                }
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;

                Intent gallery = new Intent(Intent.ACTION_GET_CONTENT);
                gallery.addCategory(Intent.CATEGORY_OPENABLE);
                gallery.setType("image/*");

                Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                try {
                    File dir = new File(getCacheDir(), "images");
                    if (!dir.exists()) dir.mkdirs();
                    String stamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
                    File photo = File.createTempFile("PRISMA_" + stamp + "_", ".jpg", dir);
                    cameraUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", photo);
                    camera.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                    camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } catch (IOException e) {
                    camera = null;
                    cameraUri = null;
                }

                Intent chooser = Intent.createChooser(gallery, "Foto do produto");
                if (camera != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});

                try {
                    startActivityForResult(chooser, FILE_CHOOSER_CODE);
                    return true;
                } catch (ActivityNotFoundException ex) {
                    filePathCallback = null;
                    return false;
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_CODE || filePathCallback == null) return;

        Uri[] result = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            } else if (cameraUri != null) {
                result = new Uri[]{cameraUri};
            }
        }

        filePathCallback.onReceiveValue(result);
        filePathCallback = null;
        cameraUri = null;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    public class PrismaAndroidBridge {
        @JavascriptInterface
        public void updateWidget(String payload) {
            try {
                JSONObject json = new JSONObject(payload);
                getSharedPreferences("prisma_widget", MODE_PRIVATE).edit()
                    .putString("monthLabel", json.optString("monthLabel", "Este mês"))
                    .putString("monthTotal", json.optString("monthTotal", "R$ 0,00"))
                    .putInt("listPending", json.optInt("listPending", 0))
                    .putInt("listPicked", json.optInt("listPicked", 0))
                    .putString("list1", json.optJSONArray("listPreview") != null ? json.optJSONArray("listPreview").optString(0, "") : "")
                    .putString("list2", json.optJSONArray("listPreview") != null ? json.optJSONArray("listPreview").optString(1, "") : "")
                    .putString("list3", json.optJSONArray("listPreview") != null ? json.optJSONArray("listPreview").optString(2, "") : "")
                    .putInt("vehicleAlerts", json.optInt("vehicleAlerts", 0))
                    .putString("updatedAt", json.optString("updatedAt", ""))
                    .apply();

                runOnUiThread(() -> {
                    AppWidgetManager mgr = AppWidgetManager.getInstance(MainActivity.this);
                    int[] summaryIds = mgr.getAppWidgetIds(new ComponentName(MainActivity.this, PrismaWidgetProvider.class));
                    PrismaWidgetProvider.updateAll(MainActivity.this, mgr, summaryIds);
                    int[] listIds = mgr.getAppWidgetIds(new ComponentName(MainActivity.this, PrismaListWidgetProvider.class));
                    PrismaListWidgetProvider.updateAll(MainActivity.this, mgr, listIds);
                });
            } catch (Exception ignored) {
            }
        }
    }
}
