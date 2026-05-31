import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

/**
 * DashCode Logo Component
 *
 * Wrapper around Qualiflow AI LogoMark for compatibility with DashCode sidebar components
 */
export default function DashCodeLogo({ className }: { className?: string }) {
  return <LogoMark className={cn("", className)} size={44} />;
}
