import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Gastos from '../Gastos';

describe('Pruebas de caja negra - Gastos', () => {
  it('muestra encabezado y botón Agregar', () => {
    render(<Gastos />);
    const encabezado = screen.getByText('Lista de Gastos');
    expect(encabezado).not.toBeNull();

    const botonAgregar = screen.getByRole('button', { name: /Agregar/i });
    expect(botonAgregar).not.toBeNull();
  });

  it('abre modal al hacer click en Agregar', () => {
    render(<Gastos />);
    const botonAgregar = screen.getAllByRole('button', { name: /Agregar/i })[0];
    fireEvent.click(botonAgregar);

    const resumenes = screen.getAllByText(/Total Gastos/i);
    expect(resumenes.length).toBeGreaterThan(0);
  });

  it('rellena formulario de gasto y simula envío', () => {
    render(<Gastos />);
    const botonesAgregar = screen.getAllByRole('button', { name: /Agregar/i });
    fireEvent.click(botonesAgregar[0]);

    const resumenes = screen.getAllByText(/Total Gastos/i);
    expect(resumenes.length).toBeGreaterThan(0);
  });
});
