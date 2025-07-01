import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Grid, Paper, createTheme, ThemeProvider } from "@mui/material";
import { API_URL } from "../../config";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from "recharts";

const COLORS = [
  "#1976D2", "#388E3C", "#FBC02D", "#D32F2F", "#7B1FA2", "#0288D1", "#C2185B", "#FFA000"
];

const MetricasVendedor = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    prospectosPorVendedor: [],
    conversionPorVendedor: [],
    estadosPorVendedor: [],
    tiempoPromedioConversion: [],
  });

  // Detectar tema oscuro
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-bs-theme') === 'dark';
  });

  useEffect(() => {
    // Observer para cambios de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-bs-theme') {
          setIsDarkMode(document.documentElement.getAttribute('data-bs-theme') === 'dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Crear tema Material-UI dinámico
  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#754ffe',
      },
      background: {
        default: isDarkMode ? '#212529' : '#f8f9fa',
        paper: isDarkMode ? '#343a40' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#212529',
        secondary: isDarkMode ? '#adb5bd' : '#6c757d',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#343a40' : '#ffffff',
            border: isDarkMode ? '1px solid #495057' : '1px solid #dee2e6',
            boxShadow: isDarkMode 
              ? '0 0.125rem 0.25rem rgba(255, 255, 255, 0.075)' 
              : '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
          },
        },
      },
    },
  });

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/supervisor/metricas-vendedor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetricas(data);
      } catch {
        setMetricas({
          prospectosPorVendedor: [],
          conversionPorVendedor: [],
          estadosPorVendedor: [],
          tiempoPromedioConversion: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetricas();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // Datos para las gráficas
  const barData = metricas.conversionPorVendedor.map(row => {
    const tiempo = metricas.tiempoPromedioConversion.find(t => t.vendedor_id === row.vendedor_id);
    return {
      vendedor: row.vendedor,
      Prospectos: row.total_prospectos,
      Ventas: row.ventas,
      "Tasa de Conversión": row.tasa_conversion,
      "Tiempo Promedio (hs)": tiempo ? tiempo.horas_promedio_conversion : 0,
    };
  });

  // Pie chart para tasa de conversión
  const pieData = metricas.conversionPorVendedor.map(row => ({
    name: row.vendedor,
    value: row.tasa_conversion,
  }));

  // Stacked bar para prospectos por estado y vendedor
  const estados = [...new Set(metricas.estadosPorVendedor.map(e => e.estado))];
  const vendedores = [...new Set(metricas.estadosPorVendedor.map(e => e.vendedor))];
  const stackedData = vendedores.map(vendedor => {
    const obj = { vendedor };
    estados.forEach(estado => {
      const found = metricas.estadosPorVendedor.find(e => e.vendedor === vendedor && e.estado === estado);
      obj[estado] = found ? found.cantidad : 0;
    });
    return obj;
  });

  // Tooltip personalizado para PieChart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography variant="body2">
            <b>{payload[0].name}</b>: {payload[0].value}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Tooltip personalizado para BarChart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography variant="body2"><b>{label}</b></Typography>
          {payload.map((entry, idx) => (
            <Typography key={idx} variant="body2" color={entry.color}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>Métricas por Vendedor</Typography>
        <Grid container spacing={3}>
          {/* BarChart: Prospectos y Ventas */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>Prospectos y Ventas por Vendedor</Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <XAxis dataKey="vendedor" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="Prospectos" fill="#1976D2">
                    <LabelList dataKey="Prospectos" position="top" />
                  </Bar>
                  <Bar dataKey="Ventas" fill="#388E3C">
                    <LabelList dataKey="Ventas" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* PieChart: Tasa de conversión */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>Tasa de Conversión (%)</Typography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* BarChart: Tiempo promedio de conversión */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>Tiempo Promedio de Conversión (hs)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <XAxis dataKey="vendedor" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="Tiempo Promedio (hs)" fill="#FBC02D">
                    <LabelList dataKey="Tiempo Promedio (hs)" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* StackedBarChart: Prospectos por estado y vendedor */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>Prospectos por Estado y Vendedor</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <XAxis dataKey="vendedor" tick={{ fontSize: 13 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  {estados.map((estado, idx) => (
                    <Bar
                      key={estado}
                      dataKey={estado}
                      stackId="a"
                      fill={COLORS[idx % COLORS.length]}
                    >
                      <LabelList dataKey={estado} position="top" />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default MetricasVendedor;