import React, { useState } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { CheckBox } from 'grommet';
import { FormattedMessage, useIntl } from 'react-intl';
import { WorkflowPageTemplate } from '../../components/WorkflowPage/WorkflowPageTemplate';
import { Paper } from '../../components/Paper';
import { OperatingSystemButtons } from './OperatingSystemButtons';
import { Instructions } from './Instructions';
import { routeToCorrectWorkflowStep } from '../../utils/RouteToCorrectWorkflowStep';
import { StoreState } from '../../store/reducers';
import { Button } from '../../components/Button';
import { routesEnum } from '../../Routes';
import { Alert } from '../../components/Alert';
import { Link } from '../../components/Link';
import { Text } from '../../components/Text';
import { Heading } from '../../components/Heading';
import { NumberInput } from './NumberInput';
import {
  DispatchWorkflowUpdateType,
  updateWorkflow,
  WorkflowStep,
} from '../../store/actions/workflowActions';
import { PRICE_PER_VALIDATOR, TICKER_NAME } from '../../utils/envVars';
import instructions1 from '../../static/instructions_1.svg';
import instructions2 from '../../static/instructions_2.svg';

export enum operatingSystem {
  'MAC',
  'LINUX',
  'WINDOWS',
}

const osMapping: { [os: number]: 'mac' | 'linux' | 'windows' } = {
  [operatingSystem.MAC]: 'mac',
  [operatingSystem.LINUX]: 'linux',
  [operatingSystem.WINDOWS]: 'windows',
};

export enum keysTool {
  'GUI',
  'CLI',
  'CLISOURCE',
}

const Highlight = styled.span`
  background: ${p => p.theme.green.medium};
`;

const InstructionImgContainer = styled.div`
  height: 250px;
  margin: 64px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
`;

// Prop definitions
interface OwnProps {}
interface StateProps {
  workflow: WorkflowStep;
}
interface DispatchProps {
  dispatchWorkflowUpdate: DispatchWorkflowUpdateType;
}
type Props = StateProps & DispatchProps & OwnProps;

const _GenerateKeysPage = ({
  dispatchWorkflowUpdate,
  workflow,
}: Props): JSX.Element => {
  const { formatMessage } = useIntl();
  const [validatorCount, setValidatorCount] = useState<number | string>(0);
  const [
    mnemonicAcknowledgementChecked,
    setMnemonicAcknowledgementChecked,
  ] = useState<boolean>(workflow > WorkflowStep.GENERATE_KEY_PAIRS);
  const [chosenOs, setChosenOs] = useState<operatingSystem>(
    operatingSystem.LINUX
  );
  const [chosenTool, setChosenTool] = useState<keysTool>(keysTool.GUI);

  const onCheckboxClick = (e: any) => {
    setMnemonicAcknowledgementChecked(e.target.checked);
  };

  const handleSubmit = () => {
    if (workflow === WorkflowStep.GENERATE_KEY_PAIRS) {
      dispatchWorkflowUpdate(WorkflowStep.UPLOAD_VALIDATOR_FILE);
    }
  };

  if (workflow < WorkflowStep.GENERATE_KEY_PAIRS) {
    return routeToCorrectWorkflowStep(workflow);
  }

  return (
    <WorkflowPageTemplate
      title={formatMessage({ defaultMessage: 'Generate key pairs' })}
    >
      <Paper>
        <Heading level={2} size="small" color="blueDark">
          <FormattedMessage defaultMessage="How many validators would you like to run?" />
        </Heading>
        <div className="flex mt20">
          <div>
            <Text className="mb5">
              <FormattedMessage defaultMessage="Validators" />
            </Text>
            <NumberInput value={validatorCount} setValue={setValidatorCount} />
          </div>
          <div className="ml50">
            <Text className="mb5">Cost</Text>
            <Text>
              {validatorCount === ''
                ? validatorCount
                : new BigNumber(validatorCount)
                    .times(new BigNumber(PRICE_PER_VALIDATOR))
                    .toFixed(1)
                    .toString()}{' '}
              {TICKER_NAME}
            </Text>
          </div>
        </div>
      </Paper>
      <Paper className="mt20">
        <Heading level={2} size="small" color="blueMedium">
          <FormattedMessage defaultMessage="What is your current operating system?" />
        </Heading>
        <Text className="mt20 mb40">
          <FormattedMessage
            defaultMessage="Choose the OS of the computer you're currently using. This will be the
              computer you use to generate your keys. It doesn't need to be the OS
              you want to use for your node."
          />
        </Text>
        <OperatingSystemButtons chosenOs={chosenOs} setChosenOs={setChosenOs} />
      </Paper>

      <Instructions
        validatorCount={validatorCount}
        os={osMapping[chosenOs]}
        chosenTool={chosenTool}
        setChosenTool={setChosenTool}
      />

      <Paper className="mt20">
        <Heading level={2} size="small" color="blueMedium">
          <FormattedMessage defaultMessage="Save the key files and get the validator file ready" />
        </Heading>
        <Text className="mt20">
          {chosenTool === keysTool.GUI ? (
            <FormattedMessage
              defaultMessage="You should now have your mnemonic written down in a safe place and a
              keystore saved for each of your {validatorCount} validators. Please
              make sure you keep these safe, preferably offline. Your validator
              keystores should be available in the selected directory."
              values={{
                validatorCount: <span>{validatorCount}</span>,
              }}
            />
          ) : (
            <FormattedMessage
              defaultMessage="You should now have your mnemonic written down in a safe place and a
              keystore saved for each of your {validatorCount} validators. Please
              make sure you keep these safe, preferably offline. Your validator
              keystores should be available in the newly created
              {validatorKeys} directory."
              values={{
                validatorKeys: <Highlight>validator_keys</Highlight>,
                validatorCount: <span>{validatorCount}</span>,
              }}
            />
          )}
        </Text>
        <Alert variant="info" className="my40">
          <FormattedMessage
            defaultMessage="You should see that you have one keystore per validator. This keystore
              contains your signing key, encrypted with your password. You can use
              your mnemonic to generate your withdrawal key when you wish to
              withdraw."
          />
        </Alert>
        <InstructionImgContainer>
          <img src={instructions1} alt="" />
        </InstructionImgContainer>
        <Text>
          <FormattedMessage
            defaultMessage="The other file you just generated is
            {depositDataJson}. This file contains the
            public key(s) associated with your validator(s); You will need to
            upload this in the next step."
            values={{
              depositDataJson: <Highlight>deposit_data.json</Highlight>,
            }}
          />
        </Text>
        <InstructionImgContainer>
          <img src={instructions2} alt="" />
        </InstructionImgContainer>
        <Alert variant="error">
          <FormattedMessage
            defaultMessage="Warning: Do not store keys on multiple (backup) validators at once"
            description="Warns users to not run backup validators that have a live copy of their signing keys. Keys should only be on one validator machine at once."
          />
          <Link
            className="mt10"
            primary
            to="https://medium.com/prysmatic-labs/eth2-slashing-prevention-tips-f6faa5025f50"
          >
            <FormattedMessage defaultMessage="More on slashing prevention" />
          </Link>
        </Alert>
      </Paper>
      <Paper className="mt20">
        <CheckBox
          onChange={onCheckboxClick}
          checked={mnemonicAcknowledgementChecked}
          label={
            <Text>
              <FormattedMessage defaultMessage="I am keeping my key(s) safe and have written down my mnemonic phrase." />
            </Text>
          }
        />
      </Paper>

      <div className="flex center p30">
        <Link to={routesEnum.selectClient}>
          <Button
            className="mr10"
            width={100}
            label={formatMessage({ defaultMessage: 'Back' })}
          />
        </Link>
        <Link to={routesEnum.uploadValidatorPage} onClick={handleSubmit}>
          <Button
            width={300}
            rainbow
            disabled={!mnemonicAcknowledgementChecked}
            label={formatMessage({ defaultMessage: 'Continue' })}
          />
        </Link>
      </div>
    </WorkflowPageTemplate>
  );
};

const mapStateToProps = ({ workflow }: StoreState): StateProps => ({
  workflow,
});
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  dispatchWorkflowUpdate: (workflowStep: WorkflowStep) => {
    dispatch(updateWorkflow(workflowStep));
  },
});

export const GenerateKeysPage = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  StoreState
>(
  mapStateToProps,
  mapDispatchToProps
)(_GenerateKeysPage);
