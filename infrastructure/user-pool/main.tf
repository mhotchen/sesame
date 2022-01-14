variable name {type = string}

resource aws_cognito_user_pool pool {
  name = var.name
  password_policy {
    minimum_length = 8
    require_lowercase = false
    require_numbers = false
    require_symbols = false
    require_uppercase = false
    temporary_password_validity_days = 7
  }
}

resource aws_cognito_user_group admin {
  name = "admin"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource aws_cognito_user_pool_client web {
  name = "${var.name}-web"
  user_pool_id = aws_cognito_user_pool.pool.id
  refresh_token_validity = 30

  explicit_auth_flows = ["USER_PASSWORD_AUTH"]

  callback_urls = ["oauth2://callback"]
  logout_urls = ["oauth2://sign-out"]
}

resource aws_ssm_parameter arn {
  name = "/user-pool/${var.name}/arn"
  type = "SecureString"
  value = aws_cognito_user_pool.pool.arn
}

resource aws_ssm_parameter id {
  name = "/user-pool/${var.name}/id"
  type = "SecureString"
  value = aws_cognito_user_pool.pool.id
}

resource aws_ssm_parameter client-web-id {
  name = "/user-pool/${var.name}/client-web-id"
  type = "SecureString"
  value = aws_cognito_user_pool_client.web.id
}

resource aws_ssm_parameter group-admin {
  name = "/user-pool/${var.name}/group-admin"
  type = "SecureString"
  value = aws_cognito_user_group.admin.name
}