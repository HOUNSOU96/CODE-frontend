package bj.code.education;

import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ScreenSecurity")
public class ScreenSecurityPlugin extends Plugin {

    @PluginMethod
    public void setSecure(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", false);

        getActivity().runOnUiThread(() -> {
            if (Boolean.TRUE.equals(enabled)) {
                getActivity().getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SECURE
                );
            } else {
                getActivity().getWindow().clearFlags(
                    WindowManager.LayoutParams.FLAG_SECURE
                );
            }

            JSObject result = new JSObject();
            result.put("enabled", Boolean.TRUE.equals(enabled));
            call.resolve(result);
        });
    }
}
