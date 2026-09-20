package com.aoshi.prisma;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

public class PrismaListWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        updateAll(context, manager, appWidgetIds);
    }

    public static void updateAll(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) updateOne(context, manager, id);
    }

    private static void updateOne(Context context, AppWidgetManager manager, int id) {
        SharedPreferences p = context.getSharedPreferences("prisma_widget", Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_prisma_list);

        int pending = p.getInt("listPending", 0);
        v.setTextViewText(R.id.wl_count, pending + " pendente" + (pending == 1 ? "" : "s"));
        setLine(v, R.id.wl_item1, p.getString("list1", ""));
        setLine(v, R.id.wl_item2, p.getString("list2", ""));
        setLine(v, R.id.wl_item3, p.getString("list3", ""));
        v.setTextViewText(R.id.wl_updated, p.getString("updatedAt", "Abra o Prisma para atualizar"));

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(context, 1, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        v.setOnClickPendingIntent(R.id.wl_root, pi);
        manager.updateAppWidget(id, v);
    }

    private static void setLine(RemoteViews v, int id, String text) {
        if (text == null || text.trim().isEmpty()) {
            v.setViewVisibility(id, View.GONE);
        } else {
            v.setViewVisibility(id, View.VISIBLE);
            v.setTextViewText(id, "• " + text);
        }
    }
}
