import math
import os
import re
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from dotenv import load_dotenv
from thefuzz import fuzz
from supabase import create_client


# ============================================================
# CONFIGURAÇÃO
# ============================================================

st.set_page_config(
    page_title="BotNotas",
    page_icon="🧾",
    layout="wide",
    initial_sidebar_state="collapsed",
)

BASE_DIR = Path(__file__).parent

# No PC local, lê o mesmo .env usado pelo bot.
load_dotenv(BASE_DIR / ".env")


def segredo(nome):
    # Funciona localmente via variável de ambiente/.env carregado pelo processo
    # e no Streamlit Cloud via st.secrets.
    try:
        if nome in st.secrets:
            return st.secrets[nome]
    except Exception:
        pass

    return os.getenv(nome)


SUPABASE_URL = segredo("SUPABASE_URL")
SUPABASE_SERVICE_KEY = segredo("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    st.error(
        "SUPABASE_URL e SUPABASE_SERVICE_KEY não foram encontrados."
    )
    st.stop()

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
)


# ============================================================
# CSS - MOBILE FIRST
# ============================================================

st.markdown(
    """
<style>
:root {
    --bg: #070A12;
    --panel: #111827;
    --panel2: #151D2E;
    --purple: #7C3AED;
    --violet: #A855F7;
    --cyan: #06B6D4;
    --green: #10B981;
    --orange: #F59E0B;
    --red: #EF4444;
    --text: #F8FAFC;
    --muted: #94A3B8;
    --border: rgba(255,255,255,.09);
}

.stApp {
    background:
        radial-gradient(circle at 90% 0%, rgba(124,58,237,.15), transparent 26%),
        radial-gradient(circle at 10% 95%, rgba(6,182,212,.08), transparent 28%),
        var(--bg);
    color: var(--text);
}

.block-container {
    max-width: 1450px;
    padding-top: 1.15rem;
    padding-bottom: 4rem;
}

[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0F1422 0%, #090D17 100%);
    border-right: 1px solid var(--border);
}

h1,h2,h3,h4,p,label,
[data-testid="stMarkdownContainer"] {
    color: var(--text);
}

[data-testid="stCaptionContainer"] {
    color: var(--muted);
}

.hero {
    background: linear-gradient(135deg, rgba(124,58,237,.28), rgba(37,99,235,.17));
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 24px 28px;
    margin: 0 0 22px 0;
    box-shadow: 0 16px 45px rgba(0,0,0,.24);
}

.hero-title {
    color: #fff;
    font-size: 2rem;
    font-weight: 850;
    margin-bottom: 5px;
}

.hero-sub {
    color: #B9C4D6;
    font-size: .96rem;
}

[data-testid="stMetric"] {
    background: linear-gradient(145deg, rgba(23,30,47,.98), rgba(13,18,30,.98));
    border: 1px solid var(--border);
    border-radius: 19px;
    padding: 16px;
    box-shadow: 0 12px 28px rgba(0,0,0,.18);
}

[data-testid="stMetricLabel"] {
    color: #A9B4C6;
}

[data-testid="stMetricValue"] {
    color: #fff;
}

.stButton > button {
    width: 100%;
    border-radius: 12px;
    border: 1px solid rgba(124,58,237,.52);
    background: linear-gradient(90deg, rgba(124,58,237,.23), rgba(37,99,235,.2));
    color: white;
    font-weight: 650;
}

.stButton > button:hover {
    border-color: #A855F7;
}

.card {
    background: linear-gradient(145deg, rgba(23,30,47,.98), rgba(12,17,29,.98));
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 17px;
    margin: 0 0 12px 0;
    box-shadow: 0 10px 28px rgba(0,0,0,.15);
}

.card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.card-title {
    color: #fff;
    font-weight: 760;
    font-size: 1rem;
    line-height: 1.28;
}

.card-price {
    color: #67E8F9;
    font-weight: 800;
    font-size: 1.06rem;
    white-space: nowrap;
}

.card-sub {
    color: #95A4BA;
    font-size: .84rem;
    margin-top: 4px;
    line-height: 1.35;
}

.card-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.chip {
    display: inline-block;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: .76rem;
    color: #C8D2E2;
    background: rgba(255,255,255,.055);
    border: 1px solid rgba(255,255,255,.06);
}

.chip-purple {
    color: #DDD6FE;
    background: rgba(124,58,237,.15);
    border-color: rgba(168,85,247,.2);
}

.chip-green {
    color: #A7F3D0;
    background: rgba(16,185,129,.12);
    border-color: rgba(16,185,129,.2);
}

.chip-orange {
    color: #FDE68A;
    background: rgba(245,158,11,.12);
    border-color: rgba(245,158,11,.2);
}

.section-kicker {
    color: #8FA0B8;
    text-transform: uppercase;
    letter-spacing: .08em;
    font-size: .72rem;
    margin-bottom: 4px;
}

.empty {
    background: rgba(255,255,255,.035);
    border: 1px dashed rgba(255,255,255,.1);
    border-radius: 16px;
    padding: 20px;
    color: #94A3B8;
}

div[data-baseweb="input"] > div,
div[data-baseweb="select"] > div {
    border-radius: 13px !important;
}

[data-testid="stExpander"] {
    background: rgba(255,255,255,.025);
    border: 1px solid var(--border);
    border-radius: 14px;
}

[data-testid="stDataFrame"] {
    border-radius: 16px;
    overflow: hidden;
}

@media (max-width: 768px) {
    .block-container {
        padding-left: .78rem;
        padding-right: .78rem;
        padding-top: .65rem;
    }

    .hero {
        padding: 17px;
        border-radius: 18px;
        margin-bottom: 18px;
    }

    .hero-title {
        font-size: 1.58rem;
    }

    .hero-sub {
        font-size: .88rem;
    }

    [data-testid="stMetric"] {
        padding: 14px;
        border-radius: 16px;
    }

    [data-testid="stMetricValue"] {
        font-size: 1.95rem;
    }

    .card {
        border-radius: 16px;
        padding: 14px;
    }

    .card-title {
        font-size: .95rem;
    }

    .card-price {
        font-size: 1rem;
    }

    h1 {
        font-size: 1.65rem !important;
    }

    h2 {
        font-size: 1.3rem !important;
    }
}
</style>
""",
    unsafe_allow_html=True,
)


# ============================================================
# SUPABASE
# ============================================================

def testar_supabase():
    for tabela in (
        "notas",
        "itens",
        "produtos_alias",
        "produtos_rejeitados",
    ):
        (
            supabase.table(tabela)
            .select("id")
            .limit(1)
            .execute()
        )


@st.cache_data(ttl=15)
def carregar_notas():
    resposta = (
        supabase.table("notas")
        .select(
            "id,chave,nome_estabelecimento,cnpj,"
            "data_emissao,valor_total,criado_em"
        )
        .order("id", desc=True)
        .execute()
    )

    df = pd.DataFrame(resposta.data or [])

    colunas = [
        "id",
        "chave",
        "nome_estabelecimento",
        "cnpj",
        "data_emissao",
        "valor_total",
        "criado_em",
    ]

    if df.empty:
        return pd.DataFrame(columns=colunas + ["data_dt", "estabelecimento"])

    for coluna in colunas:
        if coluna not in df.columns:
            df[coluna] = None

    df["data_dt"] = pd.to_datetime(
        df["data_emissao"],
        errors="coerce",
    )

    df["estabelecimento"] = (
        df["nome_estabelecimento"]
        .fillna("")
        .astype(str)
        .str.strip()
    )

    df.loc[
        df["estabelecimento"] == "",
        "estabelecimento",
    ] = df["cnpj"].fillna("-")

    df["estabelecimento"] = (
        df["estabelecimento"]
        .astype(str)
        .str.upper()
    )

    return df


@st.cache_data(ttl=15)
def carregar_itens():
    resposta_itens = (
        supabase.table("itens")
        .select(
            "id,nota_id,produto,quantidade,unidade,"
            "preco_unitario,valor_total"
        )
        .order("id", desc=True)
        .execute()
    )

    itens_df = pd.DataFrame(resposta_itens.data or [])

    colunas_itens = [
        "id",
        "nota_id",
        "produto",
        "quantidade",
        "unidade",
        "preco_unitario",
        "valor_total",
    ]

    if itens_df.empty:
        return pd.DataFrame(
            columns=colunas_itens
            + [
                "nome_estabelecimento",
                "cnpj",
                "data_emissao",
                "chave",
                "data_dt",
                "estabelecimento",
            ]
        )

    for coluna in colunas_itens:
        if coluna not in itens_df.columns:
            itens_df[coluna] = None

    resposta_notas = (
        supabase.table("notas")
        .select(
            "id,nome_estabelecimento,cnpj,data_emissao,chave"
        )
        .execute()
    )

    notas_df = pd.DataFrame(resposta_notas.data or [])

    if notas_df.empty:
        itens_df["nome_estabelecimento"] = None
        itens_df["cnpj"] = None
        itens_df["data_emissao"] = None
        itens_df["chave"] = None
    else:
        notas_df = notas_df.rename(columns={"id": "nota_id"})
        itens_df = itens_df.merge(
            notas_df,
            on="nota_id",
            how="left",
        )

    itens_df["data_dt"] = pd.to_datetime(
        itens_df["data_emissao"],
        errors="coerce",
    )

    itens_df["estabelecimento"] = (
        itens_df["nome_estabelecimento"]
        .fillna("")
        .astype(str)
        .str.strip()
    )

    itens_df.loc[
        itens_df["estabelecimento"] == "",
        "estabelecimento",
    ] = itens_df["cnpj"].fillna("-")

    itens_df["estabelecimento"] = (
        itens_df["estabelecimento"]
        .astype(str)
        .str.upper()
    )

    return itens_df


@st.cache_data(ttl=15)
def carregar_aliases():
    resposta = (
        supabase.table("produtos_alias")
        .select("id,alias,produto_canonico,criado_em")
        .order("produto_canonico")
        .execute()
    )

    df = pd.DataFrame(resposta.data or [])
    if df.empty:
        return pd.DataFrame(
            columns=["id", "alias", "produto_canonico", "criado_em"]
        )

    return df.sort_values(
        ["produto_canonico", "alias"],
        kind="stable",
    )


@st.cache_data(ttl=15)
def carregar_rejeitados():
    resposta = (
        supabase.table("produtos_rejeitados")
        .select("id,produto_a,produto_b,criado_em")
        .execute()
    )

    df = pd.DataFrame(resposta.data or [])
    if df.empty:
        return pd.DataFrame(
            columns=["id", "produto_a", "produto_b", "criado_em"]
        )

    return df


def montar_alias_map(df_aliases):
    if df_aliases.empty:
        return {}

    return {
        str(row["alias"]).strip(): str(row["produto_canonico"]).strip()
        for _, row in df_aliases.iterrows()
    }


def resolver_canonico(nome, alias_map):
    if nome is None or pd.isna(nome):
        return ""

    atual = str(nome).strip()
    visitados = set()

    while atual in alias_map and atual not in visitados:
        visitados.add(atual)
        atual = alias_map[atual]

    return atual


def salvar_alias(alias, canonico):
    alias = str(alias).strip()
    canonico = str(canonico).strip()

    if not alias or not canonico or alias == canonico:
        return

    (
        supabase.table("produtos_alias")
        .upsert(
            {
                "alias": alias,
                "produto_canonico": canonico,
            },
            on_conflict="alias",
        )
        .execute()
    )

    st.cache_data.clear()


def excluir_alias(alias_id):
    (
        supabase.table("produtos_alias")
        .delete()
        .eq("id", int(alias_id))
        .execute()
    )
    st.cache_data.clear()


def par_ordenado(a, b):
    a = str(a).strip()
    b = str(b).strip()
    return tuple(sorted((a, b), key=str.casefold))


def rejeitar_par(a, b):
    a, b = par_ordenado(a, b)

    (
        supabase.table("produtos_rejeitados")
        .upsert(
            {
                "produto_a": a,
                "produto_b": b,
            },
            on_conflict="produto_a,produto_b",
        )
        .execute()
    )

    st.cache_data.clear()


def limpar_rejeicoes():
    (
        supabase.table("produtos_rejeitados")
        .delete()
        .neq("id", 0)
        .execute()
    )
    st.cache_data.clear()


def normalizar_nome_produto(nome):
    texto = str(nome or "").upper()
    texto = re.sub(r"[^A-Z0-9À-Ú ]", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def gerar_sugestoes(produtos, rejeitados, minimo=85, maximo=94):
    rejeitados_set = {
        par_ordenado(row["produto_a"], row["produto_b"])
        for _, row in rejeitados.iterrows()
    } if not rejeitados.empty else set()

    nomes = sorted(set(str(x).strip() for x in produtos if str(x).strip()))
    sugestoes = []

    for i in range(len(nomes)):
        for j in range(i + 1, len(nomes)):
            a, b = nomes[i], nomes[j]
            if par_ordenado(a, b) in rejeitados_set:
                continue

            score = fuzz.token_sort_ratio(
                normalizar_nome_produto(a),
                normalizar_nome_produto(b),
            )

            if minimo <= score <= maximo:
                sugestoes.append((score, a, b))

    sugestoes.sort(reverse=True, key=lambda x: x[0])
    return sugestoes


# ============================================================
# HELPERS
# ============================================================

def moeda(valor):
    if valor is None or pd.isna(valor):
        return "R$ 0,00"

    return (
        f"R$ {float(valor):,.2f}"
        .replace(",", "X")
        .replace(".", ",")
        .replace("X", ".")
    )


def formatar_cnpj(valor):
    if valor is None or pd.isna(valor):
        return "-"

    digitos = re.sub(r"\D", "", str(valor))

    if len(digitos) != 14:
        return str(valor)

    return (
        f"{digitos[:2]}.{digitos[2:5]}.{digitos[5:8]}/"
        f"{digitos[8:12]}-{digitos[12:]}"
    )


def numero(valor):
    if valor is None or pd.isna(valor):
        return "-"

    try:
        valor = float(valor)

        if valor.is_integer():
            return str(int(valor))

        return (
            f"{valor:.3f}"
            .rstrip("0")
            .rstrip(".")
            .replace(".", ",")
        )
    except Exception:
        return str(valor)


def data_curta(valor):
    if not valor:
        return "-"

    try:
        dt = pd.to_datetime(
            valor,
            dayfirst=True,
            errors="coerce",
        )

        if pd.isna(dt):
            return str(valor)

        return dt.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return str(valor)


def html_card(
    titulo,
    preco="",
    subtitulo="",
    chips=None,
):
    chips = chips or []

    chips_html = "".join(
        f'<span class="chip {classe}">{texto}</span>'
        for texto, classe in chips
    )

    preco_html = (
        f'<div class="card-price">{preco}</div>'
        if preco
        else ""
    )

    return (
        '<div class="card">'
        '<div class="card-top">'
        f'<div class="card-title">{titulo}</div>'
        f'{preco_html}'
        '</div>'
        f'<div class="card-sub">{subtitulo}</div>'
        f'<div class="card-row">{chips_html}</div>'
        '</div>'
    )


def paginação(total, prefixo, por_pagina=8):
    if total <= por_pagina:
        return 0, total

    paginas = math.ceil(total / por_pagina)

    pagina = st.selectbox(
        "Página",
        list(range(1, paginas + 1)),
        key=f"{prefixo}_pagina",
        format_func=lambda x: f"{x} de {paginas}",
    )

    inicio = (pagina - 1) * por_pagina
    fim = min(inicio + por_pagina, total)

    return inicio, fim


def plot_layout(fig, altura=380):
    fig.update_layout(
        height=altura,
        margin=dict(l=8, r=8, t=30, b=8),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font_color="#D8E2F0",
        hoverlabel=dict(
            bgcolor="#111827",
            font_color="white",
        ),
    )
    return fig


# ============================================================
# INICIALIZAÇÃO
# ============================================================

try:
    testar_supabase()
except Exception as erro:
    st.error(f"Não consegui conectar ao Supabase: {erro}")
    st.stop()

notas = carregar_notas()
itens = carregar_itens()
aliases = carregar_aliases()
rejeitados = carregar_rejeitados()
alias_map = montar_alias_map(aliases)

if not itens.empty:
    itens["produto_canonico"] = itens["produto"].apply(
        lambda x: resolver_canonico(x, alias_map)
    )
else:
    itens["produto_canonico"] = pd.Series(dtype="object")

# Cópias completas para páginas que precisam de todo o histórico,
# como Produtos Inteligentes.
notas_completas = notas.copy()
itens_completos = itens.copy()


# ============================================================
# HERO
# ============================================================

st.markdown(
    '<div class="hero">'
    '<div class="hero-title">🧾 BotNotas</div>'
    '<div class="hero-sub">Compras, preços e NFC-e em um painel simples e visual.</div>'
    '</div>',
    unsafe_allow_html=True,
)


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("🧾 BotNotas")
st.sidebar.caption("Controle pessoal de compras")

st.sidebar.subheader("📅 Período")

meses_pt = {
    1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr",
    5: "Mai", 6: "Jun", 7: "Jul", 8: "Ago",
    9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
}

periodos_disponiveis = []

if not notas_completas.empty and "data_dt" in notas_completas.columns:
    datas_validas = notas_completas["data_dt"].dropna()
    periodos_disponiveis = sorted(
        datas_validas.dt.to_period("M").unique().tolist(),
        reverse=True,
    )

opcoes_periodo = ["Todo o histórico"] + periodos_disponiveis

def rotulo_periodo(valor):
    if valor == "Todo o histórico":
        return valor

    return f"{meses_pt[int(valor.month)]}/{int(valor.year)}"

periodo_selecionado = st.sidebar.selectbox(
    "Filtrar por mês",
    opcoes_periodo,
    format_func=rotulo_periodo,
)

if periodo_selecionado != "Todo o histórico":
    inicio_periodo = periodo_selecionado.start_time
    fim_periodo = periodo_selecionado.end_time

    notas = notas_completas[
        notas_completas["data_dt"].between(
            inicio_periodo,
            fim_periodo,
            inclusive="both",
        )
    ].copy()

    itens = itens_completos[
        itens_completos["data_dt"].between(
            inicio_periodo,
            fim_periodo,
            inclusive="both",
        )
    ].copy()
else:
    notas = notas_completas.copy()
    itens = itens_completos.copy()

pagina = st.sidebar.radio(
    "Navegação",
    [
        "📊 Dashboard",
        "🧾 Compras",
        "📦 Produtos",
        "📈 Preços",
        "💸 Onde está mais barato",
        "🧠 Produtos inteligentes",
        "🏪 Estabelecimentos",
        "⛽ Combustível",
    ],
)

st.sidebar.divider()

if st.sidebar.button(
    "🔄 Atualizar dados",
    use_container_width=True,
):
    st.cache_data.clear()
    st.rerun()

st.sidebar.caption(
    f"{len(notas)} notas • {len(itens)} itens"
)

if periodo_selecionado != "Todo o histórico":
    st.sidebar.caption(
        f"Filtro ativo: {rotulo_periodo(periodo_selecionado)}"
    )


# ============================================================
# DASHBOARD
# ============================================================

if pagina == "📊 Dashboard":
    st.header("📊 Visão geral")
    if periodo_selecionado != "Todo o histórico":
        st.caption(f"Período: {rotulo_periodo(periodo_selecionado)}")

    total_gasto = notas["valor_total"].fillna(0).sum()
    total_notas = len(notas)
    total_itens = len(itens)
    produtos_unicos = (
        itens["produto_canonico"].nunique()
        if not itens.empty
        else 0
    )

    c1, c2 = st.columns(2)
    c1.metric("💰 Total gasto", moeda(total_gasto))
    c2.metric("🧾 Compras", total_notas)

    c3, c4 = st.columns(2)
    c3.metric("🛒 Itens", total_itens)
    c4.metric("📦 Produtos", produtos_unicos)

    st.write("")
    st.subheader("🕒 Compras recentes")

    if notas.empty:
        st.markdown(
            '<div class="empty">Nenhuma compra cadastrada.</div>',
            unsafe_allow_html=True,
        )
    else:
        for _, row in notas.head(6).iterrows():
            st.markdown(
                html_card(
                    titulo=str(row["estabelecimento"]).upper(),
                    preco=moeda(row["valor_total"]),
                    subtitulo=f"{data_curta(row['data_emissao'])} • {formatar_cnpj(row['cnpj'])}",
                    chips=[
                        ("NFC-e salva", "chip-green"),
                    ],
                ),
                unsafe_allow_html=True,
            )

    st.subheader("📅 Gastos por mês")

    df_mes = notas.dropna(
        subset=["data_dt"]
    ).copy()

    if not df_mes.empty:
        meses_pt = {
            1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr",
            5: "Mai", 6: "Jun", 7: "Jul", 8: "Ago",
            9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
        }

        df_mes["mes_ordem"] = df_mes["data_dt"].dt.to_period("M")
        df_mes["mes"] = (
            df_mes["data_dt"].dt.month.map(meses_pt)
            + "/"
            + df_mes["data_dt"].dt.year.astype(str)
        )

        mensal = (
            df_mes.groupby(
                ["mes_ordem", "mes"],
                as_index=False,
            )["valor_total"]
            .sum()
            .sort_values("mes_ordem")
        )

        fig = px.bar(
            mensal,
            x="mes",
            y="valor_total",
            text_auto=".2f",
        )

        fig.update_traces(
            marker_color="#7C3AED",
            textposition="outside",
        )

        fig.update_layout(
            xaxis_title="",
            yaxis_title="R$",
            showlegend=False,
        )

        st.plotly_chart(
            plot_layout(fig, 330),
            use_container_width=True,
        )

    st.subheader("🏪 Onde você mais gastou")

    if not notas.empty:
        mercados = (
            notas.groupby(
                ["estabelecimento", "cnpj"],
                as_index=False,
            )["valor_total"]
            .sum()
            .sort_values(
                "valor_total",
                ascending=False,
            )
        )

        fig2 = px.pie(
            mercados,
            names="estabelecimento",
            values="valor_total",
            hole=0.52,
        )

        fig2.update_traces(
            domain=dict(x=[0.03, 0.97], y=[0.18, 1.0]),
        )

        fig2.update_traces(
            textposition="inside",
            textinfo="percent",
            hovertemplate=(
                "<b>%{label}</b><br>"
                "R$ %{value:.2f}<br>"
                "%{percent}<extra></extra>"
            ),
        )

        fig2.update_traces(
            marker=dict(line=dict(width=0)),
        )

        fig2.update_layout(
            legend_title="",
            legend=dict(
                orientation="h",
                yanchor="top",
                y=-0.08,
                xanchor="center",
                x=0.5,
                font=dict(size=12),
            ),
            margin=dict(l=0, r=0, t=10, b=95),
        )

        st.plotly_chart(
            plot_layout(fig2, 460),
            use_container_width=True,
        )


# ============================================================
# COMPRAS
# ============================================================

elif pagina == "🧾 Compras":
    st.header("🧾 Compras")

    busca = st.text_input(
        "Buscar",
        placeholder="Estabelecimento, CNPJ ou chave...",
    )

    df = notas.copy()

    if busca:
        termo = busca.strip()

        df = df[
            df["estabelecimento"]
            .fillna("")
            .str.contains(
                termo,
                case=False,
                regex=False,
            )
            |
            df["cnpj"]
            .fillna("")
            .str.contains(
                termo,
                case=False,
                regex=False,
            )
            |
            df["chave"]
            .fillna("")
            .str.contains(
                termo,
                case=False,
                regex=False,
            )
        ]

    if df.empty:
        st.markdown(
            '<div class="empty">Nenhuma compra encontrada.</div>',
            unsafe_allow_html=True,
        )
    else:
        inicio, fim = paginação(
            len(df),
            "compras",
            6,
        )

        for _, row in df.iloc[inicio:fim].iterrows():
            st.markdown(
                html_card(
                    titulo=str(row["estabelecimento"]).upper(),
                    preco=moeda(row["valor_total"]),
                    subtitulo=f"{data_curta(row['data_emissao'])}",
                    chips=[
                        (f"CNPJ {formatar_cnpj(row['cnpj'])}", ""),
                        (f"Compra #{row['id']}", "chip-purple"),
                    ],
                ),
                unsafe_allow_html=True,
            )

            with st.expander(
                f"Ver itens da compra #{row['id']}"
            ):
                itens_nota = itens[
                    itens["nota_id"] == row["id"]
                ].copy()

                if itens_nota.empty:
                    st.caption("Nenhum item encontrado.")
                else:
                    for _, item in itens_nota.iterrows():
                        qtd = numero(item["quantidade"])
                        un = item["unidade"] or ""

                        st.markdown(
                            html_card(
                                titulo=item["produto"],
                                preco=moeda(item["valor_total"]),
                                subtitulo=(
                                    f"{qtd} {un} • "
                                    f"unitário {moeda(item['preco_unitario'])}"
                                ),
                            ),
                            unsafe_allow_html=True,
                        )


# ============================================================
# PRODUTOS
# ============================================================

elif pagina == "📦 Produtos":
    st.header("📦 Produtos")

    busca = st.text_input(
        "Buscar produto",
        placeholder="Leite, café, gasolina...",
    )

    df = itens.copy()

    if busca:
        df = df[
            df["produto"]
            .str.contains(
                busca,
                case=False,
                na=False,
                regex=False,
            )
        ]

    c1, c2 = st.columns(2)
    c1.metric("📦 Registros", len(df))
    c2.metric(
        "💰 Valor registrado",
        moeda(df["valor_total"].fillna(0).sum()),
    )

    st.write("")

    if df.empty:
        st.markdown(
            '<div class="empty">Nenhum produto encontrado.</div>',
            unsafe_allow_html=True,
        )
    else:
        inicio, fim = paginação(
            len(df),
            "produtos",
            8,
        )

        for _, row in df.iloc[inicio:fim].iterrows():
            qtd = numero(row["quantidade"])
            unidade = row["unidade"] or ""

            chips_produto = [
                (f"{qtd} {unidade}".strip(), ""),
                (
                    f"Unitário {moeda(row['preco_unitario'])}",
                    "chip-purple",
                ),
            ]

            if row["produto_canonico"] != row["produto"]:
                chips_produto.append(
                    (f"Original: {str(row['produto']).upper()}", "chip-green")
                )

            st.markdown(
                html_card(
                    titulo=str(row["produto_canonico"]).upper(),
                    preco=moeda(row["valor_total"]),
                    subtitulo=(
                        f"{str(row['estabelecimento']).upper()} • "
                        f"{data_curta(row['data_emissao'])}"
                    ),
                    chips=chips_produto,
                ),
                unsafe_allow_html=True,
            )


# ============================================================
# PREÇOS
# ============================================================

elif pagina == "📈 Preços":
    st.header("📈 Histórico de preços")

    produtos = sorted(
        itens["produto_canonico"]
        .dropna()
        .unique()
        .tolist()
    )

    if not produtos:
        st.markdown(
            '<div class="empty">Ainda não há produtos cadastrados.</div>',
            unsafe_allow_html=True,
        )
    else:
        produto = st.selectbox(
            "Produto",
            produtos,
            format_func=lambda x: str(x).upper(),
        )

        historico = itens[
            itens["produto_canonico"] == produto
        ].copy()

        historico = historico.dropna(
            subset=["data_dt", "preco_unitario"]
        ).sort_values("data_dt")

        if historico.empty:
            st.info("Ainda não há histórico suficiente.")
        else:
            ultimo = historico.iloc[-1]["preco_unitario"]
            menor = historico["preco_unitario"].min()
            maior = historico["preco_unitario"].max()

            st.metric(
                "💵 Último preço",
                moeda(ultimo),
            )

            c1, c2 = st.columns(2)
            c1.metric("📉 Menor", moeda(menor))
            c2.metric("📈 Maior", moeda(maior))

            if len(historico) > 1:
                fig = go.Figure()

                fig.add_trace(
                    go.Scatter(
                        x=historico["data_dt"],
                        y=historico["preco_unitario"],
                        mode="lines+markers",
                        line=dict(
                            color="#A855F7",
                            width=4,
                        ),
                        marker=dict(
                            color="#22D3EE",
                            size=9,
                        ),
                        text=historico["estabelecimento"].astype(str).str.upper(),
                        hovertemplate=(
                            "<b>%{text}</b><br>"
                            "R$ %{y:.2f}<br>"
                            "%{x|%d/%m/%Y}<extra></extra>"
                        ),
                    )
                )

                fig.update_layout(
                    xaxis_title="",
                    yaxis_title="R$",
                )

                st.plotly_chart(
                    plot_layout(fig, 330),
                    use_container_width=True,
                )
            else:
                st.caption(
                    "O gráfico aparecerá quando houver mais de uma compra desse produto."
                )

            st.subheader("Registros")

            for _, row in historico.sort_values(
                "data_dt",
                ascending=False,
            ).iterrows():
                st.markdown(
                    html_card(
                        titulo=str(row["estabelecimento"]).upper(),
                        preco=moeda(row["preco_unitario"]),
                        subtitulo=data_curta(row["data_emissao"]),
                        chips=[
                            (
                                f"{numero(row['quantidade'])} {row['unidade'] or ''}".strip(),
                                "",
                            ),
                        ],
                    ),
                    unsafe_allow_html=True,
                )


# ============================================================
# ONDE ESTÁ MAIS BARATO
# ============================================================

elif pagina == "💸 Onde está mais barato":
    st.header("💸 Onde está mais barato")
    st.caption(
        "Compare o preço real dos produtos entre os estabelecimentos "
        "com base no seu próprio histórico de compras."
    )

    if itens.empty:
        st.markdown(
            '<div class="empty">Ainda não há produtos cadastrados.</div>',
            unsafe_allow_html=True,
        )
    else:
        produtos_comp = sorted(
            itens["produto_canonico"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        produto_sel = st.selectbox(
            "Produto",
            produtos_comp,
            format_func=lambda x: str(x).upper(),
            key="mais_barato_produto",
        )

        hist = itens[
            itens["produto_canonico"] == produto_sel
        ].copy()

        hist = hist.dropna(
            subset=["preco_unitario", "data_dt"]
        ).sort_values("data_dt")

        if hist.empty:
            st.info("Ainda não há preços suficientes para este produto.")
        else:
            ultimo_row = hist.iloc[-1]
            menor_idx = hist["preco_unitario"].idxmin()
            maior_idx = hist["preco_unitario"].idxmax()
            menor_row = hist.loc[menor_idx]
            maior_row = hist.loc[maior_idx]

            ultimo = float(ultimo_row["preco_unitario"])
            menor = float(menor_row["preco_unitario"])
            maior = float(maior_row["preco_unitario"])

            variacao_desde_menor = (
                ((ultimo - menor) / menor) * 100
                if menor > 0 else 0
            )

            c1, c2 = st.columns(2)
            c1.metric("🏆 Menor preço", moeda(menor))
            c2.metric("💵 Último preço", moeda(ultimo))

            c3, c4 = st.columns(2)
            c3.metric(
                "🏪 Onde foi mais barato",
                str(menor_row["estabelecimento"]).upper(),
            )
            c4.metric(
                "📊 Diferença atual",
                f"{variacao_desde_menor:+.1f}%",
            )

            st.write("")
            st.subheader("🏪 Comparação por estabelecimento")

            comparacao = (
                hist.groupby("estabelecimento", as_index=False)
                .agg(
                    menor_preco=("preco_unitario", "min"),
                    ultimo_preco=("preco_unitario", "last"),
                    compras=("id", "count"),
                )
                .sort_values("ultimo_preco")
            )

            if not comparacao.empty:
                fig = px.bar(
                    comparacao,
                    x="estabelecimento",
                    y="ultimo_preco",
                    text_auto=".2f",
                )

                fig.update_traces(
                    marker_color="#14B8A6",
                    textposition="outside",
                )

                fig.update_layout(
                    xaxis_title="",
                    yaxis_title="R$",
                    showlegend=False,
                )

                st.plotly_chart(
                    plot_layout(fig, 340),
                    use_container_width=True,
                )

                for _, row in comparacao.iterrows():
                    st.markdown(
                        html_card(
                            titulo=str(row["estabelecimento"]).upper(),
                            preco=moeda(row["ultimo_preco"]),
                            subtitulo=(
                                f"Menor registrado: {moeda(row['menor_preco'])}"
                            ),
                            chips=[
                                (
                                    f"{int(row['compras'])} registro(s)",
                                    "chip-purple",
                                ),
                            ],
                        ),
                        unsafe_allow_html=True,
                    )

            st.subheader("📈 Evolução do preço")

            if len(hist) > 1:
                fig2 = go.Figure()
                fig2.add_trace(
                    go.Scatter(
                        x=hist["data_dt"],
                        y=hist["preco_unitario"],
                        mode="lines+markers",
                        text=hist["estabelecimento"].astype(str).str.upper(),
                        hovertemplate=(
                            "<b>%{text}</b><br>"
                            "R$ %{y:.2f}<br>"
                            "%{x|%d/%m/%Y}<extra></extra>"
                        ),
                    )
                )

                fig2.update_layout(
                    xaxis_title="",
                    yaxis_title="R$",
                )

                st.plotly_chart(
                    plot_layout(fig2, 330),
                    use_container_width=True,
                )
            else:
                st.caption(
                    "O gráfico aparecerá quando houver mais de um registro "
                    "para este produto."
                )


# ============================================================
# PRODUTOS INTELIGENTES
# ============================================================

elif pagina == "🧠 Produtos inteligentes":
    st.header("🧠 Produtos inteligentes")

    # Esta página sempre usa todo o histórico, mesmo que exista filtro mensal.
    itens = itens_completos.copy()
    st.caption(
        "Una nomes diferentes que representam o mesmo produto. "
        "O histórico de preços passa a tratá-los como um único produto."
    )

    if itens.empty:
        st.markdown(
            '<div class="empty">Ainda não há produtos cadastrados.</div>',
            unsafe_allow_html=True,
        )
    else:
        produtos_base = sorted(
            itens["produto_canonico"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        c1, c2 = st.columns(2)
        c1.metric("📦 Produtos atuais", len(produtos_base))
        c2.metric("🔗 Apelidos unidos", len(aliases))

        st.subheader("🤖 Sugestões")
        sugestoes = gerar_sugestoes(
            produtos_base,
            rejeitados,
            minimo=85,
            maximo=94,
        )

        if not sugestoes:
            st.success(
                "Nenhuma sugestão pendente entre 85% e 94% de semelhança."
            )
        else:
            st.caption(
                "Confirme apenas quando tiver certeza de que são o mesmo produto."
            )

            for indice, (score, a, b) in enumerate(sugestoes[:20]):
                with st.expander(
                    f"{score}% • {str(a).upper()}  ↔  {str(b).upper()}",
                    expanded=indice < 3,
                ):
                    principal = st.radio(
                        "Nome que ficará como principal",
                        [a, b],
                        format_func=lambda x: str(x).upper(),
                        key=f"principal_{indice}_{abs(hash((a,b)))}",
                        horizontal=False,
                    )

                    outro = b if principal == a else a

                    col1, col2 = st.columns(2)

                    if col1.button(
                        "✅ É o mesmo produto",
                        key=f"igual_{indice}_{abs(hash((a,b)))}",
                    ):
                        salvar_alias(outro, principal)
                        st.rerun()

                    if col2.button(
                        "❌ São diferentes",
                        key=f"diferente_{indice}_{abs(hash((a,b)))}",
                    ):
                        rejeitar_par(a, b)
                        st.rerun()

        st.divider()
        st.subheader("🔗 Unir manualmente")

        if len(produtos_base) >= 2:
            col1, col2 = st.columns(2)
            produto_a = col1.selectbox(
                "Produto A",
                produtos_base,
                format_func=lambda x: str(x).upper(),
                key="manual_a",
            )

            opcoes_b = [x for x in produtos_base if x != produto_a]
            produto_b = col2.selectbox(
                "Produto B",
                opcoes_b,
                format_func=lambda x: str(x).upper(),
                key="manual_b",
            )

            nome_principal = st.radio(
                "Qual nome deve permanecer?",
                [produto_a, produto_b],
                format_func=lambda x: str(x).upper(),
                key="manual_principal",
            )

            if st.button("🔗 Unir estes produtos", key="manual_unir"):
                outro = produto_b if nome_principal == produto_a else produto_a
                salvar_alias(outro, nome_principal)
                st.rerun()

        st.divider()
        st.subheader("✅ Uniões já confirmadas")

        if aliases.empty:
            st.caption("Nenhum produto foi unido manualmente ainda.")
        else:
            for _, row in aliases.iterrows():
                c1, c2 = st.columns([5, 1])
                c1.markdown(
                    f"**{str(row['alias']).upper()}**  →  "
                    f"**{str(row['produto_canonico']).upper()}**"
                )
                if c2.button(
                    "Desfazer",
                    key=f"excluir_alias_{int(row['id'])}",
                ):
                    excluir_alias(row["id"])
                    st.rerun()

        if not rejeitados.empty:
            st.divider()
            st.caption(
                f"{len(rejeitados)} comparação(ões) marcada(s) como diferentes."
            )
            if st.button("♻️ Limpar rejeições"):
                limpar_rejeicoes()
                st.rerun()


# ============================================================
# ESTABELECIMENTOS
# ============================================================

elif pagina == "🏪 Estabelecimentos":
    st.header("🏪 Estabelecimentos")

    if notas.empty:
        st.markdown(
            '<div class="empty">Nenhum estabelecimento registrado.</div>',
            unsafe_allow_html=True,
        )
    else:
        agrupado = (
            notas.groupby(
                ["estabelecimento", "cnpj"],
                as_index=False,
            )
            .agg(
                compras=("id", "count"),
                total=("valor_total", "sum"),
                ticket_medio=("valor_total", "mean"),
            )
            .sort_values(
                "total",
                ascending=False,
            )
        )

        if len(agrupado) > 1:
            fig = px.bar(
                agrupado,
                x="estabelecimento",
                y="total",
                text_auto=".2f",
            )

            fig.update_traces(
                marker_color="#06B6D4",
            )

            fig.update_layout(
                xaxis_title="",
                yaxis_title="R$",
            )

            st.plotly_chart(
                plot_layout(fig, 330),
                use_container_width=True,
            )

        for _, row in agrupado.iterrows():
            st.markdown(
                html_card(
                    titulo=str(row["estabelecimento"]).upper(),
                    preco=moeda(row["total"]),
                    subtitulo=f"CNPJ {formatar_cnpj(row['cnpj'])}",
                    chips=[
                        (
                            f"{int(row['compras'])} compra(s)",
                            "chip-purple",
                        ),
                        (
                            f"Ticket {moeda(row['ticket_medio'])}",
                            "",
                        ),
                    ],
                ),
                unsafe_allow_html=True,
            )


# ============================================================
# COMBUSTÍVEL
# ============================================================

elif pagina == "⛽ Combustível":
    st.header("⛽ Combustível")

    combustiveis = itens[
        itens["produto"]
        .str.contains(
            "GASOLINA|ETANOL|DIESEL",
            case=False,
            na=False,
            regex=True,
        )
    ].copy()

    if combustiveis.empty:
        st.markdown(
            '<div class="empty">Nenhum abastecimento encontrado.</div>',
            unsafe_allow_html=True,
        )
    else:
        litros = combustiveis["quantidade"].fillna(0).sum()
        gasto = combustiveis["valor_total"].fillna(0).sum()
        preco_medio = (
            combustiveis["preco_unitario"]
            .dropna()
            .mean()
        )

        st.metric(
            "⛽ Litros abastecidos",
            f"{numero(litros)} L",
        )

        c1, c2 = st.columns(2)
        c1.metric("💰 Gasto", moeda(gasto))
        c2.metric(
            "📊 Média/L",
            f"{moeda(preco_medio)}/L",
        )

        combustiveis = combustiveis.sort_values(
            "data_dt"
        )

        if len(combustiveis) > 1:
            fig = go.Figure()

            fig.add_trace(
                go.Scatter(
                    x=combustiveis["data_dt"],
                    y=combustiveis["preco_unitario"],
                    mode="lines+markers",
                    line=dict(
                        color="#F59E0B",
                        width=4,
                    ),
                    marker=dict(
                        size=9,
                        color="#FBBF24",
                    ),
                    text=combustiveis["estabelecimento"].astype(str).str.upper(),
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "R$ %{y:.2f}/L<br>"
                        "%{x|%d/%m/%Y}<extra></extra>"
                    ),
                )
            )

            fig.update_layout(
                xaxis_title="",
                yaxis_title="R$/L",
            )

            st.plotly_chart(
                plot_layout(fig, 330),
                use_container_width=True,
            )

        st.subheader("Abastecimentos")

        for _, row in combustiveis.sort_values(
            "data_dt",
            ascending=False,
        ).iterrows():
            st.markdown(
                html_card(
                    titulo=str(row["estabelecimento"]).upper(),
                    preco=moeda(row["valor_total"]),
                    subtitulo=(
                        f"{row['produto']} • "
                        f"{data_curta(row['data_emissao'])}"
                    ),
                    chips=[
                        (
                            f"{numero(row['quantidade'])} L",
                            "chip-orange",
                        ),
                        (
                            f"{moeda(row['preco_unitario'])}/L",
                            "",
                        ),
                    ],
                ),
                unsafe_allow_html=True,
            )
