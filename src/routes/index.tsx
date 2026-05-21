import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="pt-8 px-4 text-center">

            <h1 className="text-4xl font-bold mb-2">You are home.</h1>

            <p className="text-muted-foreground">
                Welcome to your sanctuary.
            </p>

            {/* Spacer to push content up */}
            <div className="h-40" />

        </div>
    )
}
