import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, createTheme, ThemeProvider } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import { API_URL } from "../../config";

// Componente reutilizable para animar el conteo
const CountUp = ({ end, duration = 1000, ...props }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span {...props}>{count}</span>;
};

const cardStyle = {
  bgcolor: "#f5faff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: 140,
  justifyContent: "center",
  borderRadius: 3,
  boxShadow: 2,
};

const SupervisorResumen = () => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({
    totalAsignados: 0,
    nuevosDia: 0,
    nuevosSemana: 0,
    nuevosMes: 0,
    totalVentas: 0,
    prospectosPorEstado: [],
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
  });

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/supervisor/resumen`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResumen(data);
      } catch {
        setResumen({
          totalAsignados: 0,
          nuevosDia: 0,
          nuevosSemana: 0,
          nuevosMes: 0,
          totalVentas: 0,
          prospectosPorEstado: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  // Actualizar cardStyle dinámicamente
  const dynamicCardStyle = {
    ...cardStyle,
    bgcolor: isDarkMode ? "#343a40" : "#f5faff",
  };

  if (loading) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={dynamicCardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <GroupIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Total asignados</Typography>
              <Typography variant="h4" color="primary">
                <CountUp end={resumen.totalAsignados} />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={dynamicCardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <TodayIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Nuevos hoy</Typography>
              <Typography variant="h4" color="success.main">
                <CountUp end={resumen.nuevosDia} />
              </Typography>
              <Typography variant="body2" color="text.secondary">Este día</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={dynamicCardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <DateRangeIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Nuevos semana</Typography>
              <Typography variant="h4" color="secondary.main">
                <CountUp end={resumen.nuevosSemana} />
              </Typography>
              <Typography variant="body2" color="text.secondary">Esta semana</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={dynamicCardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUpIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Nuevos mes</Typography>
              <Typography variant="h4" color="warning.main">
                <CountUp end={resumen.nuevosMes} />
              </Typography>
              <Typography variant="body2" color="text.secondary">Este mes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={dynamicCardStyle}>
            <CardContent sx={{ textAlign: "center" }}>
              <AssessmentIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>Convertidos en ventas</Typography>
              <Typography variant="h4" color="info.main">
                <CountUp end={resumen.totalVentas} />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card sx={dynamicCardStyle}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>Prospectos por estado</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {resumen.prospectosPorEstado.map((estado) => (
                  <Box key={estado.estado} sx={{ minWidth: 120, p: 1, bgcolor: "#fff", borderRadius: 2, boxShadow: 1, textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={500}>{estado.estado}</Typography>
                    <Typography variant="h6" color="primary">
                      <CountUp end={estado.cantidad} />
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </ThemeProvider>
  );
};

export default SupervisorResumen;