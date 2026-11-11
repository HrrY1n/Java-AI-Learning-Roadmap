package com.javaroadmap.stage06.api.web;

import com.javaroadmap.stage06.api.student.DuplicateStudentNoException;
import com.javaroadmap.stage06.api.student.StudentNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 全局异常处理：把"异常类型 → HTTP 状态码 + 统一错误体"的映射集中在一处。
 *
 * 纪律：业务异常给出确切状态码；未知异常一律 500 并**记录完整堆栈**（绝不吞掉根因），
 * 但响应体只给通用提示——内部细节不外泄给客户端。
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** Bean Validation 失败：400 + 字段级错误明细（来自 DTO 上的注解消息）。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(fieldError -> fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "Bad Request", "请求参数校验失败", fieldErrors));
    }

    /** 请求路径里的 id 不是数字（@PathVariable 转换失败）：400 而不是 500。 */
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest()
                .body(ApiError.of(400, "Bad Request", "路径参数类型不正确：" + e.getName()));
    }

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(StudentNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(404, "Not Found", e.getMessage()));
    }

    @ExceptionHandler(DuplicateStudentNoException.class)
    public ResponseEntity<ApiError> handleConflict(DuplicateStudentNoException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(409, "Conflict", e.getMessage()));
    }

    /** 业务对象构造器/setScore 抛出的通用业务校验：400。 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(ApiError.of(400, "Bad Request", e.getMessage()));
    }

    /** 兜底：未知异常 → 500。堆栈进日志（根因不丢），响应体只给通用提示。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception e) {
        log.error("未处理的异常", e);
        return ResponseEntity.internalServerError()
                .body(ApiError.of(500, "Internal Server Error", "服务器内部错误，请联系维护者并附上请求时间"));
    }
}
