import {PasscodeLockIcon} from '~/components/icons/PasscodeLockIcon';
import {Menu} from '~/components/ui/Menu';

export function ChangePassword() {
  return (
    <Menu.Item value="change-password">
      <PasscodeLockIcon />
      Change password
    </Menu.Item>
  );
}
