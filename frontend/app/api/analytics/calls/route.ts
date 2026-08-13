import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);
const backendDir = path.resolve(process.cwd(), '../backend');

export async function GET() {
  try {
    const { stdout } = await execPromise('uv run python src/get_call_analytics.py calls', { cwd: backendDir });
    const calls = JSON.parse(stdout);
    return NextResponse.json(calls);
  } catch (error) {
    console.error('Error fetching recent calls:', error);
    return NextResponse.json({ error: 'Failed to fetch recent calls' }, { status: 500 });
  }
}
