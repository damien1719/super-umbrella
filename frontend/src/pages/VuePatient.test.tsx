import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { usePatientStore } from '../store/patients';
import VuePatient from './VuePatient';
import { vi } from 'vitest';

// Mock du store des patients
vi.mock('../store/patients');
const mockUsePatientStore = usePatientStore as any;

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ patientId: 'test-patient-id' }),
    useNavigate: () => mockNavigate,
  };
});

describe('VuePatient', () => {
  const mockPatient = {
    id: 'test-patient-id',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01T00:00:00.000Z',
    notes: 'Test notes',
  };

  const mockStore = {
    items: [mockPatient],
    fetchAll: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.mocked(mockUsePatientStore).mockReturnValue(mockStore);
    mockNavigate.mockClear();
  });

  it('affiche les informations du patient', async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Informations du patient')).toBeInTheDocument();
    });
  });

  it('permet de passer en mode édition', async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Modifier'));

    // Vérifier que les champs sont maintenant éditables
    const firstNameInput = screen.getByDisplayValue('John');
    expect(firstNameInput).not.toBeDisabled();
  });

  it('permet de sauvegarder les modifications', async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Modifier'));

    // Modifier le prénom
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    // Sauvegarder
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(mockStore.update).toHaveBeenCalledWith('test-patient-id', {
        firstName: 'Jane',
        lastName: 'Doe',
        dob: '1990-01-01T00:00:00.000Z',
        notes: 'Test notes',
      });
    });
  });

  it("permet d'annuler les modifications", async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Modifier'));

    // Modifier le prénom
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    // Annuler
    fireEvent.click(screen.getByText('Annuler'));

    // Vérifier que le prénom est revenu à sa valeur originale
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('affiche un bouton de retour vers la liste des patients', async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Retour')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retour'));
    expect(mockNavigate).toHaveBeenCalledWith('/patients');
  });

  it('ne réinitialise pas les champs pendant la saisie', async () => {
    render(
      <BrowserRouter>
        <VuePatient />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    // Passer en mode édition
    fireEvent.click(screen.getByText('Modifier'));

    // Saisir du texte dans le champ nom
    const lastNameInput = screen.getByDisplayValue('Doe');
    fireEvent.change(lastNameInput, { target: { value: 'Doe-Smith' } });

    // Vérifier que le texte reste
    expect(screen.getByDisplayValue('Doe-Smith')).toBeInTheDocument();

    // Simuler un changement dans le store (comme si fetchAll était appelé)
    mockStore.items = [{ ...mockPatient, firstName: 'Jane' }];

    // Vérifier que le texte saisi est toujours là
    expect(screen.getByDisplayValue('Doe-Smith')).toBeInTheDocument();
  });
});
