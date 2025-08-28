import { render } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import React from 'react';

vi.mock('./WizardAIRightPanel', () => ({
  __esModule: true,
  default: vi.fn(() => <div>inner</div>),
}));

import WizardAIBilanType from './WizardAIBilanType';
import WizardAIRightPanel from './WizardAIRightPanel';

const Mocked = WizardAIRightPanel as unknown as vi.Mock;

test('forwards props to WizardAIRightPanel', () => {
  render(
    <WizardAIBilanType
      mode="bilanType"
      sectionInfo={{ id: 's', title: 't' } as any}
      trameOptions={[]}
      selectedTrame={undefined}
      onTrameChange={() => {}}
      examples={[]}
      onAddExample={() => {}}
      onRemoveExample={() => {}}
      questions={[]}
      answers={{}}
      onAnswersChange={() => {}}
      onGenerate={() => {}}
      isGenerating={false}
      bilanId="b"
      onCancel={() => {}}
    />,
  );

  expect(Mocked).toHaveBeenCalled();
  expect(Mocked.mock.calls[0][0].bilanId).toBe('b');
});
