import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);
const backendDir = path.resolve(process.cwd(), '../backend');

export async function GET() {
  try {
    const { stdout } = await execPromise('uv run python src/get_call_analytics.py overview', { cwd: backendDir });
    const overview = JSON.parse(stdout);
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}
