import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController, ToastController } from "@ionic/angular";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  userForm: FormGroup;

  user = this.api.getCurrentUser();
  posts = [];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.user.subscribe((user) => {
      if (user) {
        this.loadPrivatePosts();
      } else {
        this.posts = [];
      }
    });
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ["", Validators.required],
      email: "",
      password: ["", Validators.required],
    });
  }

  login() {
    this.api
      .signIn(this.userForm.value.username, this.userForm.value.password)
      .subscribe(
        (res) => {},
        (err) => {
          this.showError(err);
        }
      );
  }

  signUp() {
    this.api
      .signUp(
        this.userForm.value.username,
        this.userForm.value.email,
        this.userForm.value.password
      )
      .subscribe(
        async (res) => {
          const toast = await this.toastCtrl.create({
            message: res["message"],
            duration: 3000,
          });
          toast.present();
        },
        (err) => {
          this.showError(err);
        }
      );
  }

  async openPwReset() {
    const alert = await this.alertCtrl.create({
      header: "Forgot password?",
      message: "Enter your email or username to retrieve a new password",
      inputs: [
        {
          type: "text",
          name: "usernameOrEmail",
        },
      ],
      buttons: [
        {
          role: "cancel",
          text: "Back",
        },
        {
          text: "Reset Password",
          handler: (data) => {
            this.resetPw(data["usernameOrEmail"]);
          },
        },
      ],
    });

    await alert.present();
  }

  resetPw(usernameOrEmail) {
    this.api.resetPassword(usernameOrEmail).subscribe(
      async (res) => {
        const toast = await this.toastCtrl.create({
          message: res["message"],
          duration: 2000,
        });
        toast.present();
      },
      (err) => {
        this.showError(err);
      }
    );
  }

  loadPrivatePosts() {
    this.api.getPrivatePosts().subscribe((res) => {
      this.posts = res;
    });
  }

  logout() {
    this.api.logout();
  }

  async showError(err) {
    const alert = await this.alertCtrl.create({
      header: err.error.code,
      subHeader: err.error.data.status,
      message: err.error.message,
      buttons: ["OK"],
    });
    await alert.present();
  }
}
