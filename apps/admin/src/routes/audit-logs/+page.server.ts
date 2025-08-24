import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const searchParams = url.searchParams;
	const page = parseInt(searchParams.get('page') || '1');
	const limit = 50;
	const offset = (page - 1) * limit;

	// Since there's no audit_logs table yet, we'll create placeholder data
	// You can replace this with actual audit log data when the table is created
	const logs: any[] = [];
	const totalLogs = 0;
	const eventStats: Record<string, number> = {};
	const uniqueEventTypes: string[] = [];

	return {
		logs: logs || [],
		pagination: {
			currentPage: page,
			totalPages: Math.ceil((totalLogs || 0) / limit),
			totalLogs: totalLogs || 0,
			limit
		},
		eventStats,
		eventTypes: uniqueEventTypes
	};
};