
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const MobileTabs = TabsPrimitive.Root

interface MobileTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  children: React.ReactNode
}

const MobileTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  MobileTabsListProps
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" />
              Navigation
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="space-y-2 mt-6">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
})
MobileTabsList.displayName = "MobileTabsList"

const MobileTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    )
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-0 flex-shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
MobileTabsTrigger.displayName = "MobileTabsTrigger"

const MobileTabsContent = TabsPrimitive.Content

export { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent }
