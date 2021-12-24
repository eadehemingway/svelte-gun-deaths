function findYOnPathFromX(path, x) {
	const path_length = path.getTotalLength();
	let start = 0;
	let end = path_length;
	let target = (start + end) / 2;

	if (path_length === 0) return 0;

	// Ensure that x is within the range of the path
	x = Math.max(x, path.getPointAtLength(0).x);
	x = Math.min(x, path.getPointAtLength(path_length).x);

	// Walk along the path using binary search
	// to locate the point with the supplied x value
	while (target >= start && target <= path_length) {
		const pos = path.getPointAtLength(target);

		// use a threshold instead of strict equality
		// to handle javascript floating point precision
		if (Math.abs(pos.x - x) < 0.001) return pos.y;
		else if (pos.x > x) end = target;
		else start = target;

		target = (start + end) / 2;
	}
}

export { findYOnPathFromX };