
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const MobileTabs = TabsPrimitive.Root

interface MobileTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  children: React.ReactNode
}

interface MobileTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  children: React.ReactNode
  onMobileClose?: () => void
}

const MobileTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  MobileTabsListProps
>(({ className, children, onMobileClose, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleClose = () => {
    setIsOpen(false)
    if (onMobileClose) {
      onMobileClose()
    }
  }
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-h-[44px] px-4">
              <Menu className="h-4 w-4" />
              <span className="font-medium">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">Navigation</h2>
            </div>
            <TabsPrimitive.List
              ref={ref}
              className="flex flex-col space-y-1 p-4 overflow-y-auto flex-1"
              {...props}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    onMobileClick: handleClose
                  } as any)
                }
                return child
              })}
            </TabsPrimitive.List>
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

interface MobileTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  onMobileClick?: () => void
}

const MobileTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  MobileTabsTriggerProps
>(({ className, children, onClick, onMobileClick, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event)
    }
    // Close the sheet when a tab is selected on mobile
    if (isMobile && onMobileClick) {
      onMobileClick()
    }
  }
  
  if (isMobile) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex w-full items-center justify-start gap-3 rounded-lg px-4 py-3 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm min-h-[44px]",
          className
        )}
        onClick={handleClick}
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
      onClick={handleClick}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
MobileTabsTrigger.displayName = "MobileTabsTrigger"

const MobileTabsContent = TabsPrimitive.Content

export { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent }
