import { forwardRef } from "react";
import SimpleBarReact from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

type SimpleBarProps = React.ComponentProps<typeof SimpleBarReact>;

const SimpleBar = forwardRef<HTMLDivElement, SimpleBarProps>(function SimpleBar(
  { children, ...props },
  ref
) {
  return (
    <SimpleBarReact scrollableNodeProps={{ ref }} {...props}>
      {children}
    </SimpleBarReact>
  );
});

export default SimpleBar;
