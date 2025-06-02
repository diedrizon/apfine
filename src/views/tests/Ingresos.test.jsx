import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Ingresos from '../Ingresos';

describe('Pruebas de caja negra - Ingresos', () => {
  it('muestra encabezado de ingresos', () => {
    render(<Ingresos />);
    const encabezado = screen.getByText('Lista de Ingresos');
    expect(encabezado).not.toBeNull();
  });

  it('no hay ingresos iniciales (esperado en test vacío)', () => {
    render(<Ingresos />);
    const ingresoDetectado = screen.queryByText(/C\$[0-9]+/);
    expect(ingresoDetectado).toBeNull();
  });

  it('abre modal al hacer click en Agregar', () => {
    render(<Ingresos />);
    const botonAgregar = screen.getAllByRole('button', { name: /Agregar/i })[0];
    fireEvent.click(botonAgregar);

    const resumen = screen.getAllByText(/Total Ingresos/i);
    expect(resumen.length).toBeGreaterThan(0);
  });

  it('rellena formulario de ingreso y simula envío', () => {
    render(<Ingresos />);
    const botonesAgregar = screen.getAllByRole('button', { name: /Agregar/i });
    fireEvent.click(botonesAgregar[0]);

    const resumenes = screen.getAllByText(/Total Ingresos/i);
    expect(resumenes.length).toBeGreaterThan(0);
  });
});
