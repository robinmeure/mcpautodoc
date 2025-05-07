import React, { useState, useRef, useEffect } from 'react';
import { 
  Button,
  Input,
  Label,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Card,
  CardHeader,
  Title2,
  Body1,
  Divider,
  Badge,
  Tooltip,
  Toast,
  ToastTitle,
  useToastController,
  Toolbar
} from '@fluentui/react-components';
import { 
  CopyRegular, 
  DocumentSaveRegular,
  SendRegular,
  DocumentDataRegular
} from '@fluentui/react-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AccreditationService } from '../api';
import { useTheme } from '../theme/ThemeContext';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  inputGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'flex-end',
  },
  input: {
    flexGrow: 1,
  },
  markdownContainer: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingHorizontalL),
    backgroundColor: tokens.colorNeutralBackground2,
    maxHeight: '70vh',
    overflow: 'auto',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
  },
  markdownContent: {
    '& img': {
      maxWidth: '100%',
    },
    '& pre': {
      ...shorthands.padding(tokens.spacingVerticalS),
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      backgroundColor: tokens.colorNeutralBackground3,
      overflow: 'auto',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
    },
    '& th, & td': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    },
    '& blockquote': {
      ...shorthands.borderLeft('4px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.margin(0),
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  statusBadge: {
    marginLeft: tokens.spacingHorizontalM,
  },
  buttonIcon: {
    marginRight: tokens.spacingHorizontalS,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
  },
});

export const AccreditationGenerator: React.FC = () => {
  const styles = useStyles();
  const { isDarkMode } = useTheme();
  const [topic, setTopic] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [hasDocumentContent, setHasDocumentContent] = useState<boolean>(false);
  const markdownRef = useRef<HTMLDivElement>(null);
  const { dispatchToast } = useToastController();

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  useEffect(() => {
    if (markdownRef.current) {
      const documentContentElement = markdownRef.current.querySelector('.document-content');
      setHasDocumentContent(!!documentContentElement);
    }
  }, [markdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setIsComplete(false);
    setMarkdown('');
    setHasDocumentContent(false);

    try {
      await AccreditationService.getAccreditation(
        topic,
        (content, complete) => {
          setMarkdown(content);
          setIsComplete(complete);
          if (complete) {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error generating documentation:', error);
      setMarkdown(`Error generating documentation: ${(error as Error).message}`);
      setIsComplete(true);
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    showToast('Full content copied to clipboard');
  };

  const handleCopyDocumentOnly = () => {
    if (markdownRef.current) {
      const documentElement = markdownRef.current.querySelector('.document-content');
      if (documentElement) {
        // Get the inner content of the div that contains the Document property value
        const documentContent = documentElement.innerHTML
          .replace(/<\/?div[^>]*>/g, '') // Remove the div tags
          .trim();
        navigator.clipboard.writeText(documentContent);
        showToast('Document content copied to clipboard');
      }
    }
  };

  const handleSaveToFile = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-accreditation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveDocumentOnly = () => {
    if (markdownRef.current) {
      const documentElement = markdownRef.current.querySelector('.document-content');
      if (documentElement) {
        // Get the inner content of the div that contains the Document property value
        const documentContent = documentElement.innerHTML
          .replace(/<\/?div[^>]*>/g, '') // Remove the div tags
          .trim();
        const blob = new Blob([documentContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-document.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const showToast = (message: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { position: 'bottom', timeout: 3000 }
    );
  };

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader
          header={<Title2>Generate Service Accreditation Documentation</Title2>}
          description={
            <Body1>
              Enter a service topic to generate comprehensive documentation
            </Body1>
          }
        />

        <form className={styles.form} onSubmit={handleSubmit}>
          <Label htmlFor="topic-input">Topic</Label>
          <div className={styles.inputGroup}>
            <Input
              id="topic-input"
              className={styles.input}
              value={topic}
              onChange={handleTopicChange}
              placeholder="e.g., Azure Blob Storage"
              disabled={isLoading}
            />
            <Button 
              appearance="primary" 
              type="submit" 
              icon={<SendRegular />} 
              disabled={isLoading || !topic.trim()}
            >
              Generate
            </Button>
          </div>
        </form>
      </Card>

      {(isLoading || markdown) && (
        <Card>
          <CardHeader 
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title2>Documentation Output</Title2>
                {!isComplete && (
                  <Badge 
                    appearance="outline" 
                    color="informative" 
                    className={styles.statusBadge}
                  >
                    Generating...
                  </Badge>
                )}
                {isComplete && (
                  <Badge 
                    appearance="filled" 
                    color="success" 
                    className={styles.statusBadge}
                  >
                    Complete
                  </Badge>
                )}
              </div>
            }
          />
          <Divider />
          
          {isLoading && !markdown && <Spinner size="medium" label="Generating documentation..." />}
          
          {markdown && (
            <>
              <div className={styles.controls}>
                {hasDocumentContent ? (
                  <Toolbar>
                    <Tooltip content="Actions for full content" relationship="label">
                      <Button 
                        appearance="subtle"
                        disabled
                      >
                        Full Content:
                      </Button>
                    </Tooltip>
                    <Tooltip content="Copy all content to clipboard" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        icon={<CopyRegular className={styles.buttonIcon} />} 
                        onClick={handleCopyToClipboard}
                        aria-label="Copy full content to clipboard"
                      >
                        Copy All
                      </Button>
                    </Tooltip>
                    <Tooltip content="Save all content as Markdown file" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        icon={<DocumentSaveRegular className={styles.buttonIcon} />} 
                        onClick={handleSaveToFile}
                        aria-label="Save all content as Markdown file"
                      >
                        Save All
                      </Button>
                    </Tooltip>
                    
                    <Divider vertical />
                    
                    <Tooltip content="Actions for document only" relationship="label">
                      <Button 
                        appearance="subtle"
                        disabled
                      >
                        Document Only:
                      </Button>
                    </Tooltip>
                    <Tooltip content="Copy only the document content" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        appearance="primary"
                        icon={<DocumentDataRegular className={styles.buttonIcon} />} 
                        onClick={handleCopyDocumentOnly}
                        aria-label="Copy only document content"
                      >
                        Copy Document
                      </Button>
                    </Tooltip>
                    <Tooltip content="Save only document content as Markdown file" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        icon={<DocumentSaveRegular className={styles.buttonIcon} />} 
                        onClick={handleSaveDocumentOnly}
                        aria-label="Save document content as Markdown file"
                      >
                        Save Document
                      </Button>
                    </Tooltip>
                  </Toolbar>
                ) : (
                  <Toolbar>
                    <Tooltip content="Copy content to clipboard" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        icon={<CopyRegular className={styles.buttonIcon} />} 
                        onClick={handleCopyToClipboard}
                        aria-label="Copy content to clipboard"
                      >
                        Copy
                      </Button>
                    </Tooltip>
                    <Tooltip content="Save as Markdown file" relationship="label">
                      <Button 
                        className={styles.actionButton}
                        icon={<DocumentSaveRegular className={styles.buttonIcon} />} 
                        onClick={handleSaveToFile}
                        aria-label="Save as Markdown file"
                      >
                        Save
                      </Button>
                    </Tooltip>
                  </Toolbar>
                )}
              </div>
              
              <div className={styles.markdownContainer}>
                <div className={styles.markdownContent} ref={markdownRef}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter                          
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            //{...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};