import { render } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import React from 'react';
import { FileText } from 'lucide-react';

const panelMock = vi.fn(() => <div>inner</div>);

vi.mock('./WizardAIRightPanel', () => {
  const MockPanel = React.forwardRef((props, ref) => panelMock(props, ref));
  MockPanel.displayName = 'MockWizardAIRightPanel';
  return {
    __esModule: true,
    default: MockPanel,
  };
});

import WizardAIBilanType from './WizardAIBilanType';

const Mocked = panelMock;

test('forwards props to WizardAIRightPanel', () => {
  render(
    <WizardAIBilanType
      mode="bilanType"
      sectionInfo={{ id: 's', title: 't', description: 'desc', icon: FileText }}
      trameOptions={[]}
      selectedTrame={undefined}
      onTrameChange={() => {}}
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
