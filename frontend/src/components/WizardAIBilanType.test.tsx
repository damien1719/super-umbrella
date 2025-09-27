import { render } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import { FileText } from 'lucide-react';

const panelMock = vi.fn(() => <div>inner</div>);

vi.mock('./WizardAIRightPanel', () => ({
  __esModule: true,
  default: (props: any) => {
    panelMock(props);
    return <div>inner</div>;
  },
}));

import WizardAIBilanType from './WizardAIBilanType';

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

  expect(panelMock).toHaveBeenCalled();
  expect(panelMock.mock.calls[0][0].bilanId).toBe('b');
});
