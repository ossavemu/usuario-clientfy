const validateServicePassword = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/validate-service-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        isValid: false,
        message: errorData.message || 'Error en la validación',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en validación:', error);
    return {
      success: false,
      isValid: false,
      message: 'Error al validar la contraseña del servicio',
    };
  }
};

export { validateServicePassword };
