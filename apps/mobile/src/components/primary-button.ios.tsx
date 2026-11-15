import { Button, Host } from "@expo/ui";
import { controlSize } from "@expo/ui/swift-ui/modifiers";

import type { PrimaryButtonProps } from "./primary-button";

// iOS: nút SwiftUI `borderedProminent` cỡ lớn, cao hơn mức tối thiểu 44pt của HIG.
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: PrimaryButtonProps) {
  return (
    <Host matchContents>
      <Button
        label={label}
        onPress={onPress}
        disabled={disabled}
        modifiers={[controlSize("large")]}
      />
    </Host>
  );
}
