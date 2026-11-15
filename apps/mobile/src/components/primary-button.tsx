import { Button, Host } from "@expo/ui";

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

// Android: nút filled của Material 3 (Jetpack Compose), Compose tự giữ vùng chạm tối thiểu 48dp.
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: PrimaryButtonProps) {
  return (
    <Host matchContents>
      <Button label={label} onPress={onPress} disabled={disabled} />
    </Host>
  );
}
