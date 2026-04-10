'use client';

import {QrCode} from '@ark-ui/react';
import {createRecipeContext} from '~/utils/createRecipeContext';
import {qrCodeRecipe} from './QrCode.recipe';

const {withContext, withProvider} = createRecipeContext(qrCodeRecipe);

export const Root = withProvider(QrCode.Root, 'root');
export const Frame = withProvider(QrCode.Frame, 'frame');
export const Overlay = withProvider(QrCode.Overlay, 'overlay');
export const Pattern = withProvider(QrCode.Pattern, 'pattern');
export const DownloadTrigger = withContext(QrCode.DownloadTrigger, 'downloadTrigger');
export const Context = QrCode.Context;
