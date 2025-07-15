"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { AutoUpdateControls } from "@/components/AutoUpdateControls";
import { DebugPanel } from "@/components/DebugPanel";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					{/* Connection Settings */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Connection</h3>
						<ConnectionPanel />
					</div>

					{/* Auto Update Settings */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Auto Update</h3>
						<AutoUpdateControls />
					</div>

					{/* Debug Panel */}
					<div>
						<h3 className="text-lg font-semibold mb-4">Debug Info</h3>
						<DebugPanel />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
