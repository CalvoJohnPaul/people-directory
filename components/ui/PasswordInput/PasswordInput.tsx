import {PasswordInput} from '@ark-ui/react/password-input';
import {EyeClosedIcon, EyeIcon} from 'lucide-react';
import {createRecipeContext} from '~/utils/createRecipeContext';
import {passwordInputRecipe} from './PasswordInput.recipe';

const {withContext, withProvider} = createRecipeContext(passwordInputRecipe);

export const Root = withProvider(PasswordInput.Root, 'root');
export const Label = withContext(PasswordInput.Label, 'indicator');
export const Control = withContext(PasswordInput.Control, 'control');
export const Input = withContext(PasswordInput.Input, 'input');
export const Indicator = withContext(PasswordInput.Indicator, 'indicator', {
  defaultProps: {
    asChild: true,
    fallback: <EyeClosedIcon />,
    children: <EyeIcon />,
  },
});
export const VisibilityTrigger = withContext(PasswordInput.VisibilityTrigger, 'visibilityTrigger');
export const Context = PasswordInput.Context;
