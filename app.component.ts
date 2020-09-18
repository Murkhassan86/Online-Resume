import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { Resume, Experience, Education, Skill } from './resume';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  final : any;
  title = 'online-resume-builder';
  resume = new Resume ();
  Degrees = ['B.E', 'M.E', 'B.COM', 'M.COM' ];
  
  constructor(){
    this.resume = JSON.parse(sessionStorage.getItem('resume')) || new Resume ();
    if (! this.resume.experiences || this.resume.experiences.length === 0){
      this.resume.experiences = [];
      this.resume.experiences.push(new Experience())
    }

    if(! this.resume.educations || this.resume.educations.length === 0) {
      this.resume.educations = [];
      this.resume.educations.push(new Education());
    }

    if(! this.resume.skills || this.resume.skills.length === 0) {
      this.resume.skills = [];
      this.resume.skills.push(new Skill());
    }
  }

  addExperience() {
    this.resume.experiences.push(new Experience());
  }

   addEducation () {
     this.resume.educations.push(new Education());
   }

   addSkill () {
     this.resume.skills.push(new Skill());
   }

   generatePdf (action = 'open') {
     const documentDefinition = this.getDocumnetDefinition();

     switch (action) {
       case 'open': pdfMake.createPdf(documentDefinition).open();
       break;
       case 'print' : pdfMake.createPdf(documentDefinition).print();
       break;
       case 'download': pdfMake.createPdf(documentDefinition).download();
       break;

       default : pdfMake.createPdf(documentDefinition).open(); break;
     }

   }
resetForm (){
  this.resume = new Resume();
}
   getDocumnetDefinition () {
    sessionStorage.setItem('resume', JSON.stringify(this.resume));
     return {
     content : [
       {
       text: 'RESUME',
       bold: true,
       fontSize: 20,
       alignment: 'center',
       margin : [0, 0, 0, 20]
       },
       {
         columns: [
          [{
             text: this.resume.name,
             style: 'name'
           },
           {
             text : this.resume.address
           },
           {
             text : 'Email :' + this.resume.email
           },
           {
             text: 'Contact No :' + this.resume.contactNo
           }, 
           {
            text: 'GitHub : ' + this.resume.socialProfile,
            Link: this.resume.socialProfile,
            color: 'blue'
           }
         ],
        
           [
             this.getProfilePicObject()
           ]
     ]
    },
    {
      text: 'skills',
      style: 'header'
    },
    {
      columns : [
        {
          ul : [
            ...this.resume.skills.filter((value, index) => index % 3 === 0).map(sk => sk.value)
          ]
        },
        {
          ul : [
            ...this.resume.skills.filter((value, index) => index % 3 === 1).map(sk => sk.value )
          ]
        },
        {
          ul : [
            ...this.resume.skills.filter((value, index) => index % 3 === 2).map(sk => sk.value)
          ]
        }
      ]
    },
    {
      text: 'Experience',
      style: 'header'
    },
    this.getExperienceObject(this.resume.experiences),
    {
      text: 'Education',
      style: 'header'
    },
    this.getEducationObject(this.resume.educations),
    {
      text: 'other details',
      style: 'header'
    },
   {
     text: this.resume.otherDetails
   },
   {
     text: 'Signature',
     style: 'sign'
   },
   {
     columns : [
       {
         qr: this.resume.name + ', Contact No : ' + this.resume.contactNo, fit : 100 },
         {
           text : `(${this.resume.name})`, 
           alignment: 'right,'
         }
     ]
   } 
  ],
  info : {
    title: this.resume.name + '_Resume',
    author: this.resume.name,
    subject: 'RESUME',
    keywords: 'Resume, Online Resume'

  },
  styles : {
    header: {
      fontsize : 18,
      bold: true,
      margin: [0, 20, 0, 10],
      decoration: 'underline'
    },
    name : {
      fontsize: 16,
      bold: true
    },
    jobTitle : {
      fontsize: 14,
      bold: true,
      italics: true
    },
    sign : {
      margin : [0, 50, 0, 10],
      alignment : 'right',
      italics: true
    },
    tableHeader : {
      bold: true,
    }
  }
};
   }
    getExperienceObject (experiences: Experience[]) {
      const exs = [];
      experiences.forEach(experience => {
        exs.push(
          [{
            columns : [
              [{
                text: experience.jobtitle,
                style : 'JobTitle'
              },
            {
                text: experience.employer
            },
            {
              text: experience.jobDescription
            }],
            {
              text: 'Experience : ' + experience.experience + 'Months',
              alignment: 'right'
            }
            ]
          }]
        );
      });
      return {
        table : {
          widths : ['*'],
          body : [
            ...exs
          ]
        }
      };
    }

    getEducationObject(educations: Education[]) {
      return {
        table : {
        widths : ['*', '*', '*', '*'],
        body : [
          [{
            text : 'Degree',
            style: 'tableHeader'
          },
        {
          text: 'College',
          style: 'tableHeader'
        },
      {
        text: 'Passing Year',
        style: 'tableHeader'
      },
      {
        text: 'Percentage',
        style: 'tableHeader'
      },
      ],
      ...educations.map(ed => {
          return [ed.degree, ed.college, ed.passingYear, ed.percentage];
      })
        ]
        }
      };
    }
    /*
    Styles : {
      name: {
        fontsize: 16,
        bold: true
      }
    }*/
     getProfilePicObject() {
          if (this.resume.profilePic) {
            return {
              image : this.resume.profilePic,
              width: 75,
              alignment: 'right'
            };
          }
          return null;
     }
   fileChanged(e) {
     const file = e.target.files[0];
     this.getBase64(file);
   }

   getBase64(file){
    const reader = new FileReader ();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.resume.profilePic = reader.result as string;
    };
    reader.onerror = (error) => {
      console.log('Error: ', error);
    }
  }
   


  
  
  /*generatePdf(){
    const documentDefinition = {
      content : 'this is an sample PDF printed '
    };
    pdfMake.createPdf(documentDefinition).open();
  }*/
}
