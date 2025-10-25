package com.suggesto.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.webkit.WebSettings;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Force system font scaling off
        Configuration configuration = getResources().getConfiguration();
        if (configuration.fontScale != 1f) {
            configuration.fontScale = 1f;
            Resources res = getResources();
            res.updateConfiguration(configuration, res.getDisplayMetrics());
        }
    }

    @Override
    public void onStart() {
        super.onStart();

        // Force WebView text scaling to 100% (ignore Android settings)
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setTextZoom(100);
        }
    }
}
