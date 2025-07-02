import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast border shadow-lg data-[type=success]:bg-emerald-600/90 data-[type=error]:bg-red-600/90 data-[type=warning]:bg-amber-500/90 data-[type=info]:bg-blue-600/90 text-white",
          description: "opacity-90",
          actionButton: "bg-white/20 hover:bg-white/30 text-white",
          cancelButton: "bg-black/20 hover:bg-black/30 text-white",
        },
      }}
      closeButton
      {...props}
    />
  );
};

export { Toaster, toast };
