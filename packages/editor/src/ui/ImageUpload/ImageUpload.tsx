import React, { useState, useRef, useCallback } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorIcon from '@mui/icons-material/Error';
import type { ImageLoaded, ImageUploadProps, ImageUploadState } from './types';
import { defaultTranslations } from './defaultTranslations';
import type { TranslatorFunction } from '../../core/components/hooks';
import { useUiTranslator } from '../../core/components/hooks';

const NO_FILE_ERROR_CODE = 1;
const BAD_EXTENSION_ERROR_CODE = 2;
const TOO_BIG_ERROR_CODE = 3;
const UPLOADING_ERROR_CODE = 4;

const ImageUpload: React.FC<ImageUploadProps & { t: TranslatorFunction }> = ({
  allowedExtensions,
  maxFileSize,
  imageLoaded,
  imageUpload,
  imageUploaded,
  imageUploadError,
  translations,
  icon,
  style,
  t,
}) => {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    hasError: false,
    errorText: '',
    progress: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExtension = useCallback(
    (fileName: string) => {
      const patternPart = allowedExtensions
        ? allowedExtensions.map((a) => a.toLowerCase()).join('|')
        : '';
      const pattern = '(' + patternPart.replace(/\./g, '\\.') + ')$';
      return new RegExp(pattern, 'i').test(fileName.toLowerCase());
    },
    [allowedExtensions]
  );

  const handleError = useCallback(
    (errorCode: number) => {
      let errorText: string | null;

      switch (errorCode) {
        case NO_FILE_ERROR_CODE:
          errorText = t(translations?.noFileError);
          break;
        case BAD_EXTENSION_ERROR_CODE:
          errorText = t(translations?.badExtensionError);
          break;
        case TOO_BIG_ERROR_CODE:
          errorText = t(translations?.tooBigError);
          break;
        case UPLOADING_ERROR_CODE:
          errorText = t(translations?.uploadingError);
          break;
        default:
          errorText = t(translations?.unknownError);
          break;
      }

      // Need to flick "isUploading" because otherwise the handler doesn't fire properly
      setState({ hasError: true, errorText, isUploading: true, progress: 0 });
      setTimeout(() => {
        setState((prev) => ({ ...prev, isUploading: false }));
      }, 0);

      setTimeout(() => {
        setState((prev) => ({ ...prev, hasError: false, errorText: '' }));
      }, 5000);
    },
    [t, translations]
  );

  const readFile = useCallback((file: File): Promise<ImageLoaded> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Read the image via FileReader API and save image result in state.
      reader.onload = function (e: ProgressEvent) {
        // Add the file name to the data URL

        let dataUrl: string = (e.target as any).result;
        dataUrl = dataUrl.replace(';base64', `;name=${file.name};base64`);
        resolve({ file, dataUrl });
      };

      reader.readAsDataURL(file);
    });
  }, []);

  const handleReportProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (!e.target.files || !e.target.files[0]) {
          handleError(NO_FILE_ERROR_CODE);
          return;
        }
        const file = e.target.files[0];
        if (!hasExtension(file.name)) {
          handleError(BAD_EXTENSION_ERROR_CODE);
          return;
        }
        if (maxFileSize && file.size > maxFileSize) {
          handleError(TOO_BIG_ERROR_CODE);
          return;
        }
        if (imageLoaded) {
          readFile(file).then((data) => imageLoaded?.(data));
        }
        if (imageUpload) {
          setState((prev) => ({ ...prev, isUploading: true }));
          imageUpload(file, handleReportProgress)
            .then((resp) => {
              setState((prev) => ({
                ...prev,
                progress: undefined,
                isUploading: false,
              }));
              imageUploaded && imageUploaded(resp);
            })
            .catch((error) => {
              setState((prev) => ({ ...prev, isUploading: false }));
              imageUploadError && imageUploadError(error);
            });
        }
      },
      [
        hasExtension,
        maxFileSize,
        imageLoaded,
        imageUpload,
        imageUploaded,
        imageUploadError,
        readFile,
        handleReportProgress,
        handleError,
      ]
    );

  const handleFileUploadClick: React.MouseEventHandler<HTMLElement> =
    useCallback(() => {
      fileInputRef.current?.click();
    }, []);

  const renderChildren = useCallback(() => {
    if (state.isUploading) {
      return <CircularProgress value={state.progress} size={19} />;
    }
    if (state.hasError) {
      return (
        <span>
          {state.errorText}
          <ErrorIcon style={{ marginLeft: '8px' }} />
        </span>
      );
    }
    return (
      <span>
        {translations?.buttonContent}
        {icon as React.ReactNode}
      </span>
    );
  }, [
    state.isUploading,
    state.hasError,
    state.errorText,
    state.progress,
    translations?.buttonContent,
    icon,
  ]);

  return (
    <>
      <Button
        disabled={state.isUploading}
        variant="contained"
        color={state.hasError ? 'secondary' : 'primary'}
        onClick={handleFileUploadClick}
        style={style}
        size="small"
      >
        {renderChildren()}
      </Button>
      {!state.isUploading && (
        <input
          style={{ display: 'none' }}
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelected}
        />
      )}
    </>
  );
};

export default (props: ImageUploadProps) => {
  const { t } = useUiTranslator();
  const propsWithDefaults = {
    icon: <CloudUploadIcon style={{ marginLeft: '8px' }} />,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    maxFileSize: 5242880,
    translations: defaultTranslations,
    ...props,
  };
  return <ImageUpload {...propsWithDefaults} t={t} />;
};
