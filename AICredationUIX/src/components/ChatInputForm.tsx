import React from 'react';
import { Button, Input, makeStyles, shorthands, tokens, useId } from '@fluentui/react-components';
import { SendRegular, DismissRegular } from '@fluentui/react-icons';

interface ChatInputFormProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isActive: boolean;
  placeholder?: string;
}

const useStyles = makeStyles({
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto auto auto',
    width: '100%',
    maxWidth: '880px',
    ...shorthands.gap(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    ...shorthands.margin('0', '0', tokens.spacingVerticalL, '0'),
  },
  label: {
    gridColumn: '1 / span 2',
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  inputRow: {
    gridColumn: '1 / 1',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
  },
  buttonCell: {
    gridColumn: '2 / 2',
    display: 'flex',
    alignItems: 'stretch',
  },
  input: {
    fontSize: tokens.fontSizeBase400,
    // Strengthen input affordance without boxy styling
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ':hover': {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
    ':focus-within': {
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '1px',
    },
    flexGrow: 1,
  },
  submitButton: {
    minWidth: '124px',
    fontWeight: tokens.fontWeightSemibold,
    height: '100%',
    alignSelf: 'stretch',
  },
  metaRow: {
    gridColumn: '1 / span 2',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalL),
  },
  hint: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    lineHeight: 1.2,
    maxWidth: '480px',
  },
  validation: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorStatusWarningForeground1,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXXS),
  }
});

export const ChatInputForm: React.FC<ChatInputFormProps> = React.memo(({
  topic,
  onTopicChange,
  onSubmit,
  onCancel,
  isActive,
  placeholder = 'Enter a topic for documentation'
}) => {
  const styles = useStyles();
  const inputId = useId('topic-input');
  const hintId = `${inputId}-hint`;
  const validationId = `${inputId}-validation`;

  const trimmed = topic.trim();
  const canSubmit = !!trimmed && !isActive;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTopicChange(e.target.value);
  };

  const showValidation = !trimmed && !isActive;

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      aria-busy={isActive}
      data-active={isActive ? 'true' : 'false'}
      aria-describedby={`${hintId}${showValidation ? ' ' + validationId : ''}`}
    >
      <label htmlFor={inputId} className={styles.label}>Topic</label>
      <div className={styles.inputRow}>
        <Input
          id={inputId}
          aria-describedby={hintId}
          value={topic}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isActive}
          size="large"
          appearance="filled-lighter"
          autoComplete="off"
          className={styles.input}
          spellCheck
        />
      </div>
      <div className={styles.buttonCell}>
        {isActive ? (
          <Button
            type="button"
            onClick={onCancel}
            icon={<DismissRegular />}
            size="large"
            appearance="secondary"
            className={styles.submitButton}
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!canSubmit}
            icon={<SendRegular />}
            size="large"
            appearance="primary"
            className={styles.submitButton}
          >
            Generate
          </Button>
        )}
      </div>
      <div className={styles.metaRow}>
        <span id={hintId} className={styles.hint}>Concise, specific topics produce clearer accreditation outputs.</span>
        {showValidation && (
          <span id={validationId} className={styles.validation}>Enter a topic to enable generation</span>
        )}
      </div>
    </form>
  );
});

ChatInputForm.displayName = 'ChatInputForm';