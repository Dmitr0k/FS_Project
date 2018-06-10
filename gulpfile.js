var   gulp = require('gulp'),
	browserSync = require("browser-sync").create();

gulp.task("server", function () {
	browserSync.init({
		server: { baseDir: './app/public' }
	});
      gulp.watch('app/**/*.html').on('change', browserSync.reload);
      gulp.watch('app/**/*.css').on('change', browserSync.reload);
});

gulp.task('default', ['server']);


