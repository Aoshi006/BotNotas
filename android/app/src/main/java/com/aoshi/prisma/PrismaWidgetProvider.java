package com.aoshi.prisma;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class PrismaWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        updateAll(context, manager, appWidgetIds);
    }

    public static void updateAll(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) updateOne(context, manager, id);
    }

    private static void updateOne(Context context, AppWidgetManager manager, int id) {
        SharedPreferences p = context.getSharedPreferences("prisma_widget", Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_prisma);

        v.setTextViewText(R.id.w_month_label, p.getString("monthLabel", "Este mês"));
        v.setTextViewText(R.id.w_month_total, p.getString("monthTotal", "Abra o Prisma"));
        v.setTextViewText(R.id.w_list_count, p.getInt("listPending", 0) + " itens");
        int alerts = p.getInt("vehicleAlerts", 0);
        v.setTextViewText(R.id.w_vehicle, alerts == 0 ? "Veículo em dia" : alerts + " alerta(s) do veículo");
        v.setTextViewText(R.id.w_updated, p.getString("updatedAt", "Toque para atualizar"));

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        v.setOnClickPendingIntent(R.id.w_root, pi);
        manager.updateAppWidget(id, v);
    }
}
